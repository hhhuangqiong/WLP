var logger            = require('winston');
var Q                 = require('q');
var di                = require('di');
var injector          = new di.Injector([]);
// because we don't have password strenght requirement at the moment
var owasp             = require('owasp-password-strength-test');
var speakeasy         = require('speakeasy');
var portalUserManager = require('app/lib/portal/UserManager');

var SignUp = (function() {
  function SignUp(portalUserManager) {
    var _this = this;

    this.verifyRequest = (req, res, next) => {
      req.checkQuery('username').notEmpty().isEmail();
      req.checkQuery('token').notEmpty();

      var errors = req.validationErrors();
      if (errors) {
        next(new Error('Invalid signup request'));
      } else {
        next();
      }
    };

    this.preSignUp = function(req, res, next) {
      var PortalUserManager = _this.PortalUserManager;

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
        return Q.ninvoke(PortalUserManager, 'verifySignUpToken', token);
      }

      function expireToken(user) {
        if (!user) {
          throw new Error('Invalid token.');
        }
        user.token.signUp.expired = true;
        return user;
      }

      function prepareGoogleAuthQRCode(user) {
        var qRCode = speakeasy.generate_key({
          name: 'M800 Whitelabel Portal Sign Up',
          lenght: 20,
          google_auth_qr: true
        });

        //temporary; should read from config
        user.googleAuthInfo(qRCode.base32, 'base32');

        req.locals = {};
        req.locals.google_auth_qr = qRCode.google_auth_qr;
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
    };
    this.signUp = function(req, res, next) {
      var PortalUserManager = _this.PortalUserManager;
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
        return Q.ninvoke(PortalUserManager, 'getUser', {
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
    };
    this.PortalUserManager = portalUserManager;
    owasp.config({
      allowPassphrases: true,
      maxLength: 30,
      minLength: 8,
      minOptionalTestsToPass: 4
    });
  }
  return SignUp;
})();
di.annotate(SignUp, new di.Inject(portalUserManager));
module.exports = SignUp;
