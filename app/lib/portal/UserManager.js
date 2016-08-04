import _ from 'lodash';
import moment from 'moment';
import nconf from 'nconf';
import url from 'url';
import request from 'superagent';
import logger from 'winston';

import {
  MongoDBError,
  NotPermittedError,
  NotFoundError,
  AlreadyInUseError,
  ArgumentNullError,
  ConnectionError,
} from 'common-errors';

import { fetchDep } from '../../server/utils/bottle';
import PortalUser from '../../collections/portalUser';
import Company from '../../collections/company';

const emailClient = fetchDep(nconf.get('containerName'), 'EmailClient');
const emailUrl = fetchDep(nconf.get('containerName'), 'M800_MAIL_SERVICE_URL');

const CHANGE_PASSWORD_TOKEN = 'change-password';

const EMAIL_SENT_ERROR = 'Fail to send confirmation email';

const CREATE_USER_EMAIL_CONFIG = {
  from: 'noreply@m800.com',
  subject: 'M800 White Label Portal - Account activitation',
};

const CREATE_USER_TEMPLATE_DATA = {
  name: 'signUp',
  language: 'en-US',
  data: {
    host: process.env.APP_URL,
  },
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
    const token = user.tokens.find(_token =>
        _token.event === CHANGE_PASSWORD_TOKEN
      );
    const isVerified = token === undefined;

    const formattedUser = {
      _id: user._id,
      username: user.username,
      name: user.name,
      assignedGroup: user.assignedGroup,
      affiliatedCompany: user.affiliatedCompany,
      assignedCompanies: user.assignedCompanies,
      parentCompany: user.affiliatedCompany.parentCompany,
      carrierId: user.affiliatedCompany.carrierId,
      isVerified,

      // date formatting could be left to view layer
      createdAt: moment(user.createdAt).format('LLL'),
      updateAt: moment(user.updateAt).format('LLL'),
    };

    return formattedUser;
  }

  /**
   * Get company document by a given carrierId
   *
   * @method
   * @param {String} carrierId
   */
  getCompanyByCarrierId(carrierId) {
    return new Promise((resolve, reject) => {
      if (!carrierId) {
        reject(new ArgumentNullError('carrierId'));
        return;
      }

      Company.findOne({ carrierId }, (err, company) => {
        if (err) {
          reject(new MongoDBError('Encounter error when finding company by carrierId', err));
          return;
        }

        if (!company) {
          reject(new NotFoundError(`Cannot find company with carrierId: ${carrierId}`));
          return;
        }

        resolve(company);
      });
    });
  }

  /**
   * Get a list of user with formatted fields
   */
  getFormattedUsers() {
    return new Promise((resolve, reject) => {
      const query = PortalUser
        .find({
          isRoot: false,
        })
        .populate('createBy', 'name')
        .populate('affiliatedCompany', 'carrierId');


      query.exec((err, users) => {
        if (err) {
          reject(new MongoDBError('Database error during getting users', err));
          return;
        }
        const formattedUsers = users.map(user => this.formatUserResponse(user));

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
      if (!companyId) {
        reject(new ArgumentNullError('companyId'));
        return;
      }

      Company.getManagingCompany(companyId, (err, companies) => {
        if (err) {
          reject(new MongoDBError('Database error during getting managing companies', err));
          return;
        }

        const carrierIds = companies.map(company => company.carrierId);
        const filteredUsers = users.filter(user => carrierIds.includes(user.carrierId));

        resolve(filteredUsers);
      });
    });
  }

  /**
   * Get all users except Root for carrier
   *
   * @method
   * @param {String} carrierId
   * @param {Function} cb
   */
  async getUsers(carrierId) {
    logger.debug(`Retrieve users for carrier ${carrierId}`);

    const users = await this.getFormattedUsers(carrierId);
    const companyUsers = _.filter(users, { carrierId });
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
  async newUser(data) {
    /* Stop the remaining process if the username is registered */
    await this.validateDuplicatedUsername(data.username);

    const token = await this.sendCreatePasswordConfirmation(data.username);
    const user = await this.createUser(data);

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
    if (!user || !user.isValidPassword(oldPassword)) {
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

    const user = await PortalUser.findByEmail(username);
    if (!user) return Promise.reject(new NotFoundError('Cannot find user when reverifying user'));

    const token = await this.sendCreatePasswordConfirmation(username);

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
      if (!email) {
        reject(new ArgumentNullError('email'));
        return;
      }

      const emailConfig = _.merge(CREATE_USER_EMAIL_CONFIG, { to: email });

      emailClient.send(emailConfig, CREATE_USER_TEMPLATE_DATA, { recipient: email }, (err, token) => {
        if (err) {
          reject(new ConnectionError(EMAIL_SENT_ERROR, err));
          return;
        }

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
      if (!user) {
        reject(new ArgumentNullError('user'));
        return;
      }
      if (!token) {
        reject(new ArgumentNullError('token'));
        return;
      }

      // TODO: detect the token

      user.addToken(CHANGE_PASSWORD_TOKEN, token);
      user.save((err, _user) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(_user);
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
      if (!username) {
        reject(new ArgumentNullError('username'));
        return;
      }

      PortalUser.findOne({ username })
        .exec((err, user) => {
          if (err) {
            reject(new MongoDBError(`Encounter error when finding user ${username}`, err));
            return;
          }
          if (user) {
            reject(new AlreadyInUseError(`Target user ${username} already exists`, username));
            return;
          }
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
        if (err || !user) {
          reject(new MongoDBError(`Fail to create user ${data.username}`, err));
          return;
        }
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
    const userBeforeUpdate = await PortalUser.findOne({ _id: params.userId }).exec();
    if (!userBeforeUpdate) return Promise.reject(new NotFoundError('Cannot find user when updating user'));

    const emailChanged = userBeforeUpdate.username !== params.username;

    const toFind = { _id: params.userId };
    const toModify = { $set: params };
    const options = { new: true };

    let user = await PortalUser.findOneAndUpdate(toFind, toModify, options).exec();

    if (emailChanged) {
      const token = await this.sendCreatePasswordConfirmation(params.username);
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
      if (!user) {
        reject(new NotFoundError('User does not exist when saving user'));
        return;
      }

      user.save((err, _user) => {
        if (err) {
          reject(new MongoDBError('Fail to save user', err));
          return;
        }
        resolve(_user);
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
    const user = { _id: params.userId };

    return new Promise((resolve, reject) => {
      PortalUser.findOneAndRemove(user)
        .exec(err => {
          if (err) {
            reject(err);
            return;
          }
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
    const recipient = await this.getEmailByToken(token);
    const user = await this.getUserByTokenAndRecipient(recipient, token);

    return user;
  }

  /**
   * Set new password for verified user
   *
   * @method
   * @param {String} token
   */
  async createPassword(token, password) {
    const recipient = await this.getEmailByToken(token);
    const user = await this.getUserByTokenAndRecipient(recipient, token);

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
      if (!user) {
        reject(new ArgumentNullError('user'));
        return;
      }
      if (!password) {
        reject(new ArgumentNullError('password'));
        return;
      }

      user.removeToken(CHANGE_PASSWORD_TOKEN);
      user.set('password', password);

      user.save((err, _user) => {
        if (err) {
          reject(new MongoDBError('Fail to save user', err));
          return;
        }
        resolve(_user);
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
      PortalUser.findOne({ username: recipient })
        .exec((err, user) => {
          if (err) {
            reject(new MongoDBError('Encounter problem when finding recipient', err));
            return;
          }
          if (!user) {
            reject(new NotFoundError(`recipient:${recipient}`));
            return;
          }

          const userToken = user.tokenOf(CHANGE_PASSWORD_TOKEN);

          if (!userToken) {
            reject(new NotFoundError(`token:${CHANGE_PASSWORD_TOKEN}`));
            return;
          }

          const daysBefore = moment(userToken.createdAt).diff(moment(), 'days');

          if (daysBefore > 3) {
            reject(new RangeError('"change-password" token is expired'));
            return;
          }

          if (userToken.value !== token) {
            reject(new NotPermittedError(`Token ${userToken.value} does not match with "change-password" token ${token} for ${recipient}`));
            return;
          }
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
      const targetUrl = url.resolve(emailUrl, `/tokens/${token}`);

      const emailCb = (err, res) => {
        if (err) {
          reject(err);
          return;
        }

        try {
          const { appMeta } = res.body;

          if (!appMeta || !appMeta.recipient) {
            reject(new NotFoundError('appMeta'));
            return;
          }

          resolve(appMeta.recipient);
        } catch (e) {
          reject(e);
        }
      };

      request.get(targetUrl).end(emailCb);
    });
  }
}
