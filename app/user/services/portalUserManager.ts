import logger = require('winston');
import mongoose = require('mongoose');
import Q = require('q');
import PortalUser = require('./../models/PortalUser');
var portalUser = <PortalUser.PortalUserModel>PortalUser;

class PortalUserManagerClass {
  name: string;

  constructor() {
    this.name = 'portalUserManager';
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
  verifyUser(username: string, password: string, done: any) {
    logger.debug('verifying user login data');
    portalUser.findOne({
      username: username.toLowerCase()
    }, function(err, user) {
      if (err) {
        logger.error(err);
        return done(err);
      }
      if (!user) {
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
    })
  }
}

var PortalUserManager = new PortalUserManagerClass();
export = PortalUserManager;
