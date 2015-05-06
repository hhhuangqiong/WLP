var Q          = require('q');
var logger     = require('winston');
var moment     = require('moment');
var mongoose   = require('mongoose');

import PortalUser from '../../collections/portalUser';
import { SignUp } from '../portal/SignUp';

/**
 * @class PortalUserManager
 */
export default class PortalUserManager {

  makeForgotPasswordRequest(data, cb) {
    logger.debug('make forgot password request');
    var username = data.user.username;
    PortalUser.newForgotPasswordRequest(username, cb);
  }

  /**
   * Get all users except Root
   *
   * @method
   * @param {PortalUserModel} conditions
   * @param {Function} cb
   */
  getUsers(conditions, cb) {
    PortalUser
      .find({ isRoot: false })
      .populate('createBy', 'name')
      .populate({
        path: 'carrierDomain',
        match: {'domain': {$in: ['m800.maaii.com']}},
        select: 'name'
      })
      .exec(function(err, users) {
        if (err) return cb(err, null);

        var formatted_users = {};
        users.forEach(function(user) {
          var formatted_user = {
            '_id':            user._id,
            'username':       user.username,
            'name':           user.name,
            'status':         user.status,
            'isVerified':     user.isVerified,
            'assignedGroup':  user.assignedGroup,
            'carrierDomain':  user.carrierDomain,
            'createBy':       user.createBy,
            // date formatting could be left to view layer
            'createdAt':      moment(user.createdAt).format('LLL'),
            'updateAt':       moment(user.updateAt).format('LLL'),
            'updateBy':       user.updateBy
          };
          formatted_users[formatted_user._id] = formatted_user;
        });
        return cb(null, formatted_users);
      });
  }

  /**
   * Create new portal user
   *
   * @method
   * @param data
   * @param author
   * @param {Function} cb
   */
  newUser(data, author, cb) {
    logger.debug('newUser payload', data);

    data.affiliatedCompany = mongoose.Types.ObjectId(data.affiliatedCompany);
    data.createBy = data.updateBy = author._id;

    var findOne = Q.nbind(PortalUser.findOne, PortalUser);
    var rejectExisting = function(user) {
      if (user) throw new Error('username duplicated');
    };
    var createUser = function() {
      return Q.ninvoke(PortalUser, 'newPortalUser', data);
    };
    findOne({
      username: data.username
    }).then(rejectExisting).then(createUser).nodeify(cb); // no .catch?
  }

  /**
   * Verify PortalUser Sign Up Token
   *
   * @method
   * @param {String} token
   * @param {Function} done
   */
  //verifySignUpToken(token, done) {
  verifySignUpToken(username, token, done) {
    return done(null, user);
  }

  // TODO add a method to check if the user is verified
}

