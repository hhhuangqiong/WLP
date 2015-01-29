import _              = require('underscore');
import logger         = require('winston');
import Q              = require('q');

var di                = require('di');
var injector          = new di.Injector([]);
var owasp             = require('owasp-password-strength-test');
var speakeasy         = require('speakeasy');

var portalUserManager = require('app/lib/portal/UserManager');

interface SignUpInterface {
  password: string;
  rePassword: string;
}

class SignUp {

  PortalUserManager: PortalUserManager;

  constructor(portalUserManager) {
    this.PortalUserManager = portalUserManager;
    owasp.config({
      allowPassphrases       : true,
      maxLength              : 30,
      minLength              : 8,
      minOptionalTestsToPass : 4
    });
  }

  preSignUp = (req: any, res: Express.Response, next: Function) => {

    var PortalUserManager = this.PortalUserManager;

    Q(verifyToken(req))
      .then(verifyUser)
      .then(expireToken)
      .then(prepareGoogleAuthQRCode)
      .then(updateUser)
      .then(flashUser)
      .then(function() {
        return res.render('pages/signUp/form', {
          GoogleAuth: req.locals.google_auth_qr
        });
      })
      .catch(function(reason) {
        logger.error('Error during showing signup form', reason.stack);
        return res.render('pages/signUp/denied');
      });

    function verifyToken(req: any) {
      var token = req.query.token;

      if (!token) {
        throw new Error('Missing token.');
      }

      return token;
    }

    function verifyUser(token: string) {
      return Q.ninvoke(PortalUserManager, 'verifySignUpToken', token);
    }

    function expireToken(user: any) {

      if (!user) {
        throw new Error('Invalid token.');
      }

      user.token.signUp.expired = true;

      return user;
    }

    function prepareGoogleAuthQRCode(user: any) {
      var qRCode = speakeasy.generate_key({
        name: 'M800 Whitelabel Portal Sign Up',
        lenght: 20,
        google_auth_qr: true
      });

      user.googleAuth = qRCode.base32;

      req.locals = {};
      req.locals.google_auth_qr = qRCode.google_auth_qr;

      return user;
    }

    function updateUser(user: any) {
      var deferred = Q.defer();
      user.save(function(err, user) {
        if (err) {
          throw new Error('Error during updating user.');
        }

        return deferred.resolve(user);
      });

      return deferred.promise;
    }

    function flashUser(user: any) {
      req.session.username = user.username;
      return user;
    }
  };

  signUp: any = (req: any, res: Express.Response, next: Function) => {

    var PortalUserManager = this.PortalUserManager;

    Q(verifyIdentity(req))
      .then(verifyPassword)
      .then(getUserAndSave)
      .then(function() {
        res.render('pages/signUp/done');
      })
      .catch(function(reason) {
        logger.error('Error during signup', reason.stack);
        res.render('pages/signUp/denied');
      });

    function verifyIdentity(req: any) {
      var username = req.session.username;

      if (!username) {
        throw new Error('Undefined identity.')
      }

      return username;
    }

    function verifyPassword(username: string) {
      var password = req.body.password;
      var rePassword = req.body.rePassword;

      if (!password || !rePassword) {
        throw new Error('Missing parameters.')
      }

      if (password != rePassword) {
        throw new Error('Mismatched Password.')
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
      }
    }

    function getUserAndSave(params: {}) {
      return Q.ninvoke(PortalUserManager, 'getUser', {
        username: params.username
      }).then(function(user) {
        if (!user) {
          throw new Error('Undefined identity')
        }

        user.hashedPassword = params.password;

        var deferred = Q.defer();
        Q.ninvoke(user, 'save', function(err, user) {
          if (err) throw new Error('Error during saving new password.');

          return deferred.resolve(user);
        });

        return deferred.promise;
      })
    }
  };
}

di.annotate(SignUp, new di.Inject(portalUserManager));

export = SignUp;
