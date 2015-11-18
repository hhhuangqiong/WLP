import _          from 'lodash';
import logger     from 'winston';
import moment     from 'moment';
import mongoose   from 'mongoose';
import nconf      from 'nconf';
import url        from 'url';
import request    from 'superagent';

import {
  MongoDBError,
  NotPermittedError,
  NotFoundError,
  AlreadyInUseError,
  ArgumentNullError,
  ConnectionError
} from 'common-errors';

import { fetchDep } from '../../server/utils/bottle';
import PortalUser   from '../../collections/portalUser';
import Company      from '../../collections/company';

const emailClient = fetchDep(nconf.get('containerName'), 'EmailClient');
const emailUrl = fetchDep(nconf.get('containerName'), 'M800_MAIL_SERVICE_URL');

const CHANGE_PASSWORD_TOKEN = 'change-password';

const EMAIL_SENT_ERROR = 'Fail to send confirmation email';

const CREATE_USER_EMAIL_CONFIG = {
  from: 'noreply@m800.com',
  subject: 'M800 White Label Portal - Account activitation'
};

const CREATE_USER_TEMPLATE_DATA = {
  name: 'signUp',
  language: 'en-US',
  data: {
    host: process.env.APP_URL
  }
};

/**
 * @class PortalUserManager
 */
export default class PortalUserManager {
  /**
   * Format user response into consistant predefined format
   *
   * @method
   * @param {PortalUserModel} user
   */
  formatUserResponse(user) {
    let isVerified = user.tokens.find(token => token.event === CHANGE_PASSWORD_TOKEN) === undefined;

    let formattedUser = {
      _id:                user._id,
      username:           user.username,
      name:               user.name,
      status:             user.status,
      assignedGroup:      user.assignedGroup,
      affiliatedCompany:  user.affiliatedCompany,
      assignedCompanies:  user.assignedCompanies,
      parentCompany:      user.parentCompany,
      carrierDomain:      user.carrierDomain,
      carrierId:          user.carrierId,
      createBy:           user.createBy,
      isVerified,

      // date formatting could be left to view layer
      createdAt:      moment(user.createdAt).format('LLL'),
      updateAt:       moment(user.updateAt).format('LLL'),
      updateBy:       user.updateBy
    };

    return formattedUser;
  }

  /**
   * Extract company carrier to user field for easily identification
   *
   * @method
   * @param {String} carrierId
   * @param {Array of PortalUserModel} users
   */
  formatUsersByCarrier(carrierId, users) {
    return users.map(user => {
      let carrierId = user.affiliatedCompany.carrierId;
      user.affiliatedCompany = user.affiliatedCompany._id;
      user.carrierId = carrierId;
      return user;
    })
  }

  /**
   * Get company document by a given carrierId
   *
   * @method
   * @param {String} carrierId
   */
  getCompanyByCarrierId(carrierId) {
    return new Promise((resolve, reject) => {
      if (!carrierId) return reject(new ArgumentNullError('carrierId'));

      Company.findOne({ carrierId }, (err, company) => {
        if (err) return reject(new MongoDBError(`Encounter error when finding company by carrierId`, err));
        if (!company) return reject(new NotFoundError(`Cannot find company with carrierId: ${carrierId}`));

        resolve(company);
      });
    });
  }

  /**
   * Get a list of user with formatted fields
   */
  getFormattedUsers() {
    return new Promise((resolve, reject) => {
      PortalUser
        .find({ isRoot: false })
        .populate('createBy', 'name')
        .populate('affiliatedCompany', 'carrierId')
        .populate({
          path: 'carrierDomain',
          match: {domain: {$in: ['m800.maaii.com']}},
          select: 'name'
        })
        .exec((err, users) => {
          if (err) return reject(new MongoDBError('Database error during getting users', err));
          let formattedUsers = users.map(user => this.formatUserResponse(user));
          resolve(formattedUsers);
        });
    });
  }

  /**
   * Get users that can be managed by a given company
   *
   * @method
   * @param {Array} users
   * @param {String} companyId
   */
  getManagingUsers(users, companyId) {
    return new Promise((resolve, reject) => {
      if (!companyId) return reject(new ArgumentNullError('companyId'));

      Company.getManagingCompany(companyId, (err, companies) => {
        if (err) return reject(new MongoDBError('Database error during getting managing companies', err));

        let carrierIds = companies.map(company => company.carrierId);
        let filteredUsers = users.filter(user => carrierIds.includes(user.carrierId));

        resolve(filteredUsers);
      });
    });
  }

  /**
   * Get all users except Root
   *
   * @method
   * @param {PortalUserModel} conditions
   * @param {Function} cb
   */
  async getUsers(carrierId) {
    let users = await this.getFormattedUsers();

    let usersWithCarrierId = this.formatUsersByCarrier(carrierId, users);

    let company = await this.getCompanyByCarrierId(carrierId);

    let companyUsers = usersWithCarrierId.filter(user => user.carrierId === company.carrierId);
    let managingUsers = await this.getManagingUsers(usersWithCarrierId, company._id);

    if (!_.isEmpty(managingUsers)) return managingUsers;

    return companyUsers;
  }

  /**
   * Create new portal user
   *
   * @method
   * @param {Object} data
   * @param {Object} author
   * @param {Function} cb
   */
  async newUser(data, author) {
    /* Stop the remaining process if the username is registered */
    await this.validateDuplicatedUsername(data.username);

    let token = await this.sendCreatePasswordConfirmation(data.username);
    let user = await this.createUser(data);

    return await this.addChangePasswordToken(user, token);
  }

  /**
   * Perform changing password request by validating userId, oldPassword and newPassword
   *
   * @method
   * @param {Object} data
   * @param {Object} author
   * @param {Function} cb
   */
  async changePassword(user, oldPassword, newPassword) {
    if (!user || !user.isValidPassword(oldPassword)){
      return Promise.reject(new NotPermittedError('The password of current user is incorrect'));
    }

    return await this.setPassword(user, newPassword);
  }

  /**
   * Resend a link for recreate password
   *
   * @method
   * @param {String} username
   */
  async reverifyUser(username) {
    if (!username) return Promise.reject(new ArgumentNullError('username'));

    let user = await PortalUser.findByEmail(username);
    if (!user) return Promise.reject(new NotFoundError('Cannot find user when reverifying user'));

    let token = await this.sendCreatePasswordConfirmation(username);

    return await this.addChangePasswordToken(user, token);
  }

  /**
   * Generate a link and send to the target user
   *
   * @method
   * @param {String} recipient
   */
  sendCreatePasswordConfirmation(email) {
    return new Promise((resolve, reject) => {
      if (!email) return reject(new ArgumentNullError('email'));

      let emailConfig = _.merge(CREATE_USER_EMAIL_CONFIG, { to: email });

      emailClient.send(emailConfig, CREATE_USER_TEMPLATE_DATA, { recipient: email }, (err, token) => {
        if (err) return reject(new ConnectionError(EMAIL_SENT_ERROR, err));
        resolve(token);
      });
    });
  }

  /**
   * Create a token field for change-password to allow reverify
   *
   * @method
   * @param {Object} user
   * @param {String} token
   */
  addChangePasswordToken(user, token) {
    return new Promise((resolve, reject) => {
      if (!user) return reject(new ArgumentNullError('user'));
      if (!token) return reject(new ArgumentNullError('token'));

      // TODO: detect the token

      user.addToken(CHANGE_PASSWORD_TOKEN, token);
      user.save((err, user) => {
        if (err) return reject(err);
        resolve(user);
      });
    });
  }

  /**
   * Validate if current user exist by username
   *
   * @method
   * @param {String} recipient
   */
  validateDuplicatedUsername(username) {
    return new Promise((resolve, reject) => {
      if (!username) return reject(new ArgumentNullError('username'));

      PortalUser.findOne({ username: username }).exec((err, user) => {
        if (err) return reject(new MongoDBError(`Encounter error when finding user ${username}`, err));
        if (user) return reject(new AlreadyInUseError(`Target user ${username} already exists`, username));

        resolve();
      });
    });
  }

  /**
   * Create new portal user and insert a change-password token
   *
   * @method
   * @param {Object} data
   */
  createUser(data) {
    return new Promise((resolve, reject) => {
      PortalUser.newPortalUser(data, (err, user) => {
        if (err || !user) return reject(new MongoDBError(`Fail to create user ${data.username}`, err));
        resolve(user);
      });
    });
  }

  /**
   * Update existing portal user
   *
   * @method
   * @param {Object} params
   * @param {Function} cb
   */
   async updateUser(params) {
     let userBeforeUpdate = await PortalUser.findOne({ _id: params.userId }).exec();
     if (!userBeforeUpdate) return Promise.reject(new NotFoundError('Cannot find user when updating user'));

     let emailChanged = userBeforeUpdate.username !== params.username;

     let toFind = { _id: params.userId };
     let toModify = { $set: params };
     let options = { 'new': true };
     let user = await PortalUser.findOneAndUpdate(toFind, toModify, options).exec();

     if (emailChanged) {
       let token = await this.sendCreatePasswordConfirmation(params.username);
       user = await this.addChangePasswordToken(user, token);
       user = await this.saveUser(user);
     }

     return this.formatUserResponse(user);
   }

   /**
    * Save existing portal user
    *
    * @method
    * @param {Object} user
    */
    saveUser(user) {
      return new Promise((resolve, reject) => {
        if (!user) return reject(new NotFoundError('User does not exist when saving user'));

        user.save((err, user) => {
          if (err) return reject(new MongoDBError('Fail to save user', err));
          resolve(user);
        });
      });
    }

   /**
    * Delete existing portal user
    *
    * @method
    * @param {Object} params
    * @param {Function} cb
    */
    deleteUser(params) {
      let user = { _id: params.userId };

      return new Promise((resolve, reject) => {
        PortalUser.findOneAndRemove(user).exec((err, doc) => {
          if (err) return reject(err);
          resolve();
        });
      });
    }

  /**
   * Verify PortalUser Sign Up Token
   *
   * @method
   * @param {String} token
   */
  async verifySignUpToken(token) {
    let recipient = await this.getEmailByToken(token);
    let user = await this.getUserByTokenAndRecipient(recipient, token);

    return user;
  }

  /**
   * Set new password for verified user
   *
   * @method
   * @param {String} token
   */
  async createPassword(token, password) {
    let recipient = await this.getEmailByToken(token);
    let user = await this.getUserByTokenAndRecipient(recipient, token);

    return await this.setPassword(user, password);
  }

  /**
   * Set new password and remove the change-password token if necessary
   *
   * @method
   * @param {Object} user
   * @param {String} token
   * @param {String} password
   */
  setPassword(user, password) {
    return new Promise((resolve, reject) => {
      if (!user) return reject(new ArgumentNullError('user'));
      if (!password) return reject(new ArgumentNullError('password'));

      user.removeToken(CHANGE_PASSWORD_TOKEN);
      user.set('password', password);

      user.save((err, user) => {
        if (err) return reject(new MongoDBError('Fail to save user', err));
        resolve(user);
      });
    });
  }

  /**
   * Get user by recipient and a valid token
   *
   * @method
   * @param {String} recipient
   * @param {String} token
   */
  getUserByTokenAndRecipient(recipient, token) {
    return new Promise((resolve, reject) => {
      PortalUser.findOne({ 'username': recipient }).exec((err, user) => {
        if (err) return reject(new MongoDBError('Encounter problem when finding recipient', err));
        if (!user) return reject(new NotFoundError(`recipient:${recipient}`));

        let userToken = user.tokenOf(CHANGE_PASSWORD_TOKEN);

        if (!userToken) return reject(new NotFoundError(`token:${CHANGE_PASSWORD_TOKEN}`));

        let daysBefore = moment(userToken.createdAt).diff(moment(), 'days');

        if (daysBefore > 3) return reject(new RangeError('"change-password" token is expired'));

        if (userToken.value !== token) return reject(new NotPermittedError(`Token ${userToken.value} does not match with "change-password" token ${token} for ${recipient}`));
        resolve(user);
      });
    });
  }

  /**
   * Query the Mail Server by token to retrieve the recipient email address
   *
   * @method
   * @param {String} token
   */
  getEmailByToken(token) {
    return new Promise((resolve, reject) => {
      let targetUrl = url.resolve(emailUrl, `/tokens/${token}`);

      let emailCb = (err, res) => {
        if (err) return reject(err);

        try {
          let { appMeta } = res.body;

          if (!appMeta || !appMeta.recipient) {
            return reject(new NotFoundError('appMeta'));
          }

          resolve(appMeta.recipient);
        } catch(e) {
          reject(e);
        }
      };

      request.get(targetUrl).end(emailCb);
    });
  }
}
