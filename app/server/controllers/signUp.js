var logger            = require('winston');
var Q                 = require('q');

// because we don't have password strenght requirement at the moment
var owasp             = require('owasp-password-strength-test');
var portalUserManager = require('app/lib/portal/UserManager');

var nconf = require('nconf');

export default class Signup {

  constructor(portalUserManager) {
    this.portalUserManager = portalUserManager;
  }

  verifyRequest(req, res, next) {
    req.checkQuery('username').notEmpty().isEmail();
    req.checkQuery('token').notEmpty();

    var errors = req.validationErrors();
    if (errors) {
      next(new Error('Invalid signup request'));
    } else {
      next();
    }
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
      return Q.ninvoke(this.portalUserManager, 'verifySignUpToken', token);
    }

    function expireToken(user) {
      if (!user) {
        throw new Error('Invalid token.');
      }
      user.token.signUp.expired = true;
      return user;
    }

    function prepareGoogleAuthQRCode(user) {
      //TODO read 'name' from config
      var googleAuth = user.googleAuthInfo('M800 Whitelabel Portal Sign Up').get('googleAuth');
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
