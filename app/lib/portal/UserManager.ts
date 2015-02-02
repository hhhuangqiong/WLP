/// <reference path='../../../typings/node/node.d.ts' />

import Q        = require('q');
import logger   = require('winston');
import mongoose = require('mongoose');

var moment      = require('moment');
var speakeasy   = require('speakeasy');

import PortalUser = require('app/collections/portalUser');

class PortalUserManager {
  name: string;

  constructor() {
    this.name = 'portalUserManager';
  }

  makeForgotPasswordRequest(data: {user: PortalUser }, cb: Function) {
    logger.debug('make forgot password request');

    var username = data.user.username;
    PortalUser.newForgotPasswordRequest(username, cb);
  }

  /**
   * Get all users except Root
   *
   * @param {PortalUserModel} data
   * @param {Function} cb
   */
  getUsers(data: any, cb: Function) {
    PortalUser
      .find({isRoot: false})
      .populate('createBy', 'name')
      .exec(function(err, users) {
        if (err) {
          cb(err, null);
        }

        var formatted_users = {};

        users.forEach(function(user: any) {
          var formatted_user = {
            "id": user._id,
            "username": user.username,
            "name": user.name,
            "status": user.status,
            "isVerified": user.isVerified,
            "assignedGroups": user.assignedGroups,
            "carrierDomains": user.carrierDomains,
            "createAt": moment(user.createAt).format('LLL'),
            "createBy": user.createBy,
            "updateAt": moment(user.updateAt).format('LLL'),
            "updateBy": user.updateBy
          };

          formatted_users[formatted_user.id] = formatted_user;
        });

        cb(null, formatted_users);
      })
  }

  /**
   * Create new portal user
   *
   * @param data
   * @param author
   * @param {Function} cb
   */
  newUser(data: any, author: PortalUser, cb: Function) {
    console.log('newUser payload', data);
    data.createBy = data.updateBy = author._id;

    var findOne = Q.nbind(PortalUser.findOne, PortalUser);
    var rejectExisting = function(user) {
      if (user) throw new Error('username duplicated');
    }
    var createUser = function() {
      return Q.ninvoke(PortalUser, 'newPortalUser', data);
    }

    findOne({ username: data.username })
    .then(rejectExisting)
    .then(createUser)
    .nodeify(cb);
  }

  /**
   * Verify PortalUser Sign Up Token
   *
   * @method verifySignUpToken
   * @param {String} token
   * @param {Function} done
   */
  verifySignUpToken(token: string, done: Function) {
    logger.debug('verifying sign up token');
    PortalUser.findOne({
      "token.signUp.token": token,
      "token.signUp.expired": false
    }, function(err, user) {
      if (err) {
        logger.error(err, 'db-error');
        return done(err);
      }
      if (!user) {
        logger.debug('Invalid token %s', token);
        return done(null, null);
      }

      return done(null, user);
    })
  }

  /**
   * Verify PortalUser Login Data for Passport.js
   *
   * @method verifyUser
   * @param {String} username Username
   * @param {String} password Password
   * @param {Function} done Callback from Passport.js
   * @example
   *    portalUserManager.verifyUser('username', 'password', done);
   */
  verifyUser(username: string, password: string, done: Function) {
    logger.debug('verifying user login data');

    PortalUser.findOne({
      username: username
    }, function(err, user) {
      if (err) {
        logger.error(err);
        return done(err);
      }
      if (!user || !user.isVerified) {
        logger.debug('Invalid username %s', username);
        return done(null, false, {
          message: 'Unknown user or invalid password'
        });
      }
      if (!user.isValidPassword(password)) {
        logger.debug('Invalid user password %s', password);
        return done(null, false, {
          message: 'Unknown user or invalid password'
        });
      }

      return done(null, user);
    });
  }
}

<<<<<<< HEAD
export = PortalUserManager;
=======
//var Company = new PortalUserManagerClass();
export = PortalUserManagerClass;
>>>>>>> f34c5f9... Adding Angular support for company.
