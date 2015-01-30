import Q        = require('q');
import logger   = require('winston');
import mongoose = require('mongoose');

var moment      = require('moment');
var speakeasy   = require('speakeasy');

import Portaluser = require('app/collections/portalUser');

class PortalUserManagerClass {
  name: string;

  constructor() {
    this.name = 'portalUserManager';
  }

  /**
   * Return a user with condition(s)
   *
   * @param data
   * @param cb
   */
  getUser(data: {username: string}, cb: Function) {
    Portaluser.findOne({
      username: data.username
    }, function(err, user) {
      if (err) {
        return cb(err);
      }

      if (!user) {
        return cb(null, null);
      }

      return cb(null, user);
    })
  }

  makeForgotPasswordRequest(data: {user: Portaluser }, cb: Function) {
    logger.debug('make forgot password request');

    var username = data.user.username;

    Portaluser.newForgotPasswordRequest(username, cb);
  }

  /**
   * Get all users except Root
   *
   * @param {PortalUserModel} data
   * @param {Function} cb
   */
  getUsers(data: any, cb: Function) {
    Portaluser
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
    console.log(data);
    data.createBy = author._id;
    data.updateBy = author._id;

    var _cb = cb;

    Q.nfcall(this.getUser, data)
      .then(function(user) {
        if (user) {
          return _cb(new Error('username duplicated'), null);
        }

        Portaluser.newPortalUser(data, _cb);
      })
      .catch(function(err) {
        return _cb(err, null);
      });
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
    Portaluser.findOne({
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
    Portaluser.findOne({
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

//var PortalUserManager = new PortalUserManagerClass();
export = PortalUserManagerClass;
