var Q = require('q');
var logger = require('winston');
var moment = require('moment');
var speakeasy = require('speakeasy');
var PortalUser = require('app/collections/portalUser');
var PortalUserManager = (function () {
    function PortalUserManager() {
        this.name = 'portalUserManager';
    }
    PortalUserManager.prototype.makeForgotPasswordRequest = function (data, cb) {
        logger.debug('make forgot password request');
        var username = data.user.username;
        PortalUser.newForgotPasswordRequest(username, cb);
    };
    /**
     * Get all users except Root
     *
     * @param {PortalUserModel} data
     * @param {Function} cb
     */
    PortalUserManager.prototype.getUsers = function (data, cb) {
        PortalUser.find({ isRoot: false }).populate('createBy', 'name').exec(function (err, users) {
            if (err) {
                cb(err, null);
            }
            var formatted_users = {};
            users.forEach(function (user) {
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
        });
    };
    /**
     * Create new portal user
     *
     * @param data
     * @param author
     * @param {Function} cb
     */
    PortalUserManager.prototype.newUser = function (data, author, cb) {
        console.log('newUser payload', data);
        data.createBy = data.updateBy = author._id;
        var findOne = Q.nbind(PortalUser.findOne, PortalUser);
        var rejectExisting = function (user) {
            if (user)
                throw new Error('username duplicated');
        };
        var createUser = function () {
            return Q.ninvoke(PortalUser, 'newPortalUser', data);
        };
        findOne({ username: data.username }).then(rejectExisting).then(createUser).nodeify(cb);
    };
    /**
     * Verify PortalUser Sign Up Token
     *
     * @method verifySignUpToken
     * @param {String} token
     * @param {Function} done
     */
    PortalUserManager.prototype.verifySignUpToken = function (token, done) {
        logger.debug('verifying sign up token');
        PortalUser.findOne({
            "token.signUp.token": token,
            "token.signUp.expired": false
        }, function (err, user) {
            if (err) {
                logger.error(err, 'db-error');
                return done(err);
            }
            if (!user) {
                logger.debug('Invalid token %s', token);
                return done(null, null);
            }
            return done(null, user);
        });
    };
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
    PortalUserManager.prototype.verifyUser = function (username, password, done) {
        logger.debug('verifying user login data');
        PortalUser.findOne({
            username: username
        }, function (err, user) {
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
    };
    return PortalUserManager;
})();
module.exports = PortalUserManager;
