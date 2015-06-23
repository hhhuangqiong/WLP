import moment from 'moment';
import nconf from 'nconf';
import Q from 'q';

import util from 'util';
import { SignUp } from '../../lib/portal/SignUp';

var logger     = require('winston');

// because we don't have password strength requirement at the moment
var owasp      = require('owasp-password-strength-test');
var PortalUser = require('../../collections/portalUser');

const INVALID_PATH = '/signup/invalid';

export default class SignupController {

  constructor(portalUserManager) {
    this.portalUserManager = portalUserManager;
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
          if (SignUp.verify(user, tokenValue, compareTo)) {
            // for the next handler
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
      .catch((err) => {
        logger.error('Error during validating sign up user', err.stack);
        next(err);
      });
  }

  preSignUp(req, res, next) {
    req.checkBody('username').notEmpty().isEmail();
    req.checkBody('password').notEmpty().equals(req.sanitize('rePassword'));

    // safety check
    req.checkBody('token').notEmpty();

    var errors = req.validationErrors();
    if (errors) {
      // copied from the sample code
      req.flash('messages', 'Validation error(s)' + util.inspect(errors));
      req.flash('messageType', 'warning');
      next(err);
    } else {
      next();
    }
  }

  passwordStrengthTest(req, res, next) {
    owasp.config(nconf.get('owasp'));
    var result = owasp.test(req.sanitize('password'));
    if (result.failedTests.length != 1 || result.failedTests[0] != 6) {
      next(new Error('Insecure Password.'));
    }

    next();
  }

  /**
   * Flash scope data are prepared in the other handlers before `next(err)`
   */
  bounceBack(err, req, res, next) {
    // prepare flash in another handlers
    var username = req.sanitize('username');
    var token    = req.sanitize('token');

    // NB: what happen the token expires after redirect
    // redirect to the root page (i.e., /signup); don't know if this is an anti-pattern
    res.redirect(`./?username=${username}&token=${token}`);
  }
}
