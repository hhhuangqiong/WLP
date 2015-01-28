var Q = require('q');
var logger = require('winston');
var Portaluser = require('app/collections/portalUser');
var PortalUserManagerClass = (function () {
    function PortalUserManagerClass() {
        this.name = 'portalUserManager';
    }
    PortalUserManagerClass.prototype.getUser = function (data, cb) {
        Portaluser.findOne({
            username: data.username
        }, function (err, user) {
            console.log(err, user, data.username);
            if (err) {
                return cb(err);
            }
            if (!user) {
                return cb(null, null);
            }
            return cb(null, user);
        });
    };
    PortalUserManagerClass.prototype.makeForgotPasswordRequest = function (data, cb) {
        logger.debug('make forgot password request');
        var username = data.user.username;
        Portaluser.newForgotPasswordRequest(username, cb);
    };
    PortalUserManagerClass.prototype.getUsers = function (data, cb) {
        Portaluser.find({}).where('username').ne('root@maaii.com').exec(function (err, users) {
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
                    "createAt": user.createAt,
                    "createBy": user.createBy,
                    "updateAt": user.updateAt,
                    "updateBy": user.updateBy
                };
                formatted_users[formatted_user.id] = formatted_user;
            });
            cb(null, formatted_users);
        });
    };
    PortalUserManagerClass.prototype.newUser = function (data, author, cb) {
        data.createBy = author._id;
        data.createAt = new Date();
        data.updateBy = author._id;
        data.updateAt = new Date();
        var _cb = cb;
        Q.nfcall(this.getUser, data).then(function (user) {
            if (user) {
                return _cb(new Error('username duplicated'), null);
            }
            Portaluser.newPortalUser(data, _cb);
        }).catch(function (err) {
            return _cb(err, null);
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
    PortalUserManagerClass.prototype.verifyUser = function (username, password, done) {
        logger.debug('verifying user login data');
        Portaluser.findOne({
            username: username
        }, function (err, user) {
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
        });
    };
    return PortalUserManagerClass;
})();
module.exports = PortalUserManagerClass;
