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
      _id:            user._id,
      username:       user.username,
      name:           user.name,
      status:         user.status,
      assignedGroup:  user.assignedGroup,
      carrierDomain:  user.carrierDomain,
      createBy:       user.createBy,
      isVerified,

      // date formatting could be left to view layer
      createdAt:      moment(user.createdAt).format('LLL'),
      updateAt:       moment(user.updateAt).format('LLL'),
      updateBy:       user.updateBy
    };

    return formattedUser;
  }

  /**
   * Get all users except Root
   *
   * @method
   * @param {PortalUserModel} conditions
   * @param {Function} cb
   */
  getUsers() {
    return new Promise((resolve, reject) => {
      PortalUser
        .find({ isRoot: false })
        .populate('createBy', 'name')
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
   * Create new portal user
   *
   * @method
   * @param {Object} data
   * @param {Object} author
   * @param {Function} cb
   */
  async newUser(data, author) {
    data.affiliatedCompany = mongoose.Types.ObjectId(author.affiliatedCompany._id);
    data.createBy = data.updateBy = author._id;

    let user = await this.createUserIfNotExist(data.username, data);
    let token = await this.sendCreatePasswordConfirmation(user);

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
    let user = await PortalUser.findOne({ username }).exec();
    let token = await this.sendCreatePasswordConfirmation(user);

    return await this.addChangePasswordToken(user, token);
  }

  /**
   * Generate a link and send to the target user
   *
   * @method
   * @param {String} recipient
   */
  sendCreatePasswordConfirmation(user) {
    return new Promise((resolve, reject) => {
      if (!user || !user.username) return reject(new ArgumentNullError('user'));
      // enable this before deploy, let me know if I wrongly sublmitted this line
      // let emailConfig = _.merge(CREATE_USER_EMAIL_CONFIG, { to: user.username });
      let emailConfig = _.merge(CREATE_USER_EMAIL_CONFIG, { to: 'georgejor@maaii.com' });

      emailClient.send(emailConfig, CREATE_USER_TEMPLATE_DATA, { recipient: user.username }, (err, token) => {
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

      user.addToken(CHANGE_PASSWORD_TOKEN, token);
      user.save((err, user) => {
        if (err) return reject(err);
        resolve(user);
      });
    });
  }

  /**
   * Create new portal user with validating it existance and insert a change-password token
   *
   * @method
   * @param {String} recipient
   * @param {Object} data
   * @param {String} token
   */
  createUserIfNotExist(recipient, data) {
    return new Promise((resolve, reject) => {
      if (!recipient) return reject(new ArgumentNullError('recipient'));

      PortalUser.findOne({ username: recipient }).exec((err, user) => {
        if (err) return reject(new MongoDBError(`Encounter error when finding user ${recipient}`, err));
        if (user) return reject(new AlreadyInUseError(`Target user ${recipient} already exists`, recipient));

        PortalUser.newPortalUser(data, (err, user) => {
          if (err || !user) return reject(new MongoDBError(`Fail to create user ${recipient}`, err));

          resolve(user);
        });
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
     let toFind = { _id: params.userId };
     let toModify = { $set: params };
     let options = { 'new': true };
     let user = await PortalUser.findOneAndUpdate(toFind, toModify, options).exec();

     return this.formatUserResponse(user);
   }

   /**
    * Delete existing portal user
    *
    * @method
    * @param {Object} params
    * @param {Function} cb
    */
    deleteUser(params, cb) {
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
