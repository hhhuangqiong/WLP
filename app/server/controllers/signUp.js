import moment from 'moment';
import nconf from 'nconf';
import Q from 'q';

var logger            = require('winston');

// because we don't have password strength requirement at the moment
var owasp      = require('owasp-password-strength-test');

var PortalUser = require('app/collections/portalUser');
var SignUp     = require('app/lib/portal/SignUp');

const INVALID_PATH = '/signup/invalid';

export default class Signup {

  constructor(portalUserManager) {
    this.portalUserManager = portalUserManager;
  }

  invalidSignUp(req, res) {
    res.render('pages/signUp/invalid');
  }

  verifyRequest(req, res, next) {
    req.checkQuery('username').notEmpty().isEmail();
    req.checkQuery('token').notEmpty();

    var errors = req.validationErrors();
    if (errors) {
      req.flash('messages', 'Missing required parameter(s)');
      req.flash('messageType', 'warning');
      res.redirect(INVALID_PATH);
    } else {
      next();
    }
  }

  /**
   * Validate if the user has a valid & not-expired sign up token
   *
   * TODO
   * - i18n-ize the message
   * - the error handling page
   */
  validateSignUpUser(req, res, next) {
    Q.ninvoke(PortalUser, 'findOne', { username: req.sanitize('username').trim() })
      .then((user) => {
        var tokenValue  = req.sanitize('token').trim();
        var tokenConfig = nconf.get('signUp:token:expiry');
        var compareTo   = moment().subtract(tokenConfig.value, tokenConfig.unit).toDate();

        try {
          if(SignUp.verify(user, tokenValue, compareTo)){
            // probably not needed, let see
            req.signUpUser = user;
            next();
          } else {
            // redirect to another page?
            //TODO any messageType
            req.flash('messages', 'Invalid token or the token has already been expired');
            req.flash('messageType', 'warning');
            res.redirect(INVALID_PATH);
          }
        } catch (e) {
          req.flash('messages', 'User does not have a valid sign up request');
          req.flash('messageType', 'warning');
          res.redirect(INVALID_PATH);
        }
      })
      .catch((err)=>{
        logger.error('Error during validating sign up user', err.stack);
        next(err);
      });
  }

  preSignUp(req, res, next) {
    // TODO leave this to service layer
    Q(verifyUser(req.query.token))
      .then(expireToken)
      .then(prepareGoogleAuthQRCode)
      .then(updateUser)
      .then(flashUser)
      .then(function() {
        return res.render('pages/signUp/form', {
          GoogleAuth: req.locals.google_auth_qr
        });
      }).catch(function(reason) {
        logger.error('Error during showing signup form', reason.stack);
        return res.render('pages/signUp/denied');
      });

    //TODO veriy + expire logic could be grouped under a single method in SignUp service
    function verifyUser(token) {
      // quick & dirty way for not handling the flow now
      throw new Error('To be implemented');
    }

    function expireToken(user) {
      if (!user) {
        throw new Error('Invalid token.');
      }
      user.token.signUp.expired = true;
      return user;
    }

    function prepareGoogleAuthQRCode(user) {
      var googleAuth = user.googleAuthInfo(nconf.get('speakeasy:name')).get('googleAuth');
      req.locals.google_auth_qr = googleAuth.qrCodeUrl;
      return user;
    }

    function updateUser(user) {
      var deferred = Q.defer();
      user.save(function(err, user) {
        if (err) {
          throw new Error('Error during updating user.');
        }
        return deferred.resolve(user);
      });
      return deferred.promise;
    }

    function flashUser(user) {
      req.session.username = user.username;
      return user;
    }
  }

  signUp(req, res, next) {
    Q(verifyIdentity(req)).then(verifyPassword).then(getUserAndSave).then(function() {
      res.render('pages/signUp/done');
    }).catch(function(reason) {
      logger.error('Error during signup', reason.stack);
      res.render('pages/signUp/denied');
    });

    function verifyIdentity(req) {
      var username = req.session.username;
      if (!username) {
        throw new Error('Undefined identity.');
      }
      return username;
    }

    function verifyPassword(username) {
      var password = req.body.password;
      var rePassword = req.body.rePassword;
      if (!password || !rePassword) {
        throw new Error('Missing parameters.');
      }
      if (password != rePassword) {
        throw new Error('Mismatched Password.');
      }
      // TODO move it somewhere else
      owasp.config(nconf.get('owasp'));
      // other password strength check
      var result = owasp.test(password);
      if (result.failedTests.length != 1 || result.failedTests[0] != 6) {
        throw new Error('Insecure Password.');
      }
      return {
        username: username,
        password: password,
        rePassword: rePassword
      };
    }

    function getUserAndSave(params) {
      return Q.ninvoke(this.portalUserManager, 'getUser', {
        username: params.username
      }).then(function(user) {
        if (!user) {
          throw new Error('Undefined identity');
        }
        user.hashedPassword = params.password;
        user.isVerified = true;
        var deferred = Q.defer();
        Q.ninvoke(user, 'save', function(err, user) {
          if (err)
            throw new Error('Error during saving new password.');
          return deferred.resolve(user);
        });
        return deferred.promise;
      });
    }
  }
}
