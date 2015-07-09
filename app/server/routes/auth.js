import {Router} from 'express';
import logger from 'winston';
import passport from 'passport';

import db from '../db';
import {SIGN_IN, SIGN_OUT} from '../paths.js';

function getAuthUser(user) {
  var { _id, username, displayName } = user;
  var { carrierId, role } = user.affiliatedCompany || {};

  return { _id, username, displayName, carrierId, role };
}

var router = Router();

router.post(SIGN_IN, function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    let signInError = function() {
      return res.status(401).json({
        error: {
          name: 'BadCredentials',
          message: 'Wrong username or password'
        }
      });
    };

    // TODO simplify this
    if (err || !user) {
      return signInError();
    }

    req.logIn(user, function(err) {
      if (err) {
        logger.error('failed during `req.logIn`', err);
        return signInError();
      }

      // from 'express-session'
      let token = req.sessionID;
      let authUser = getAuthUser(user);

      req.session.data = {
        token: token,
        user: authUser._id,
        username: authUser.username,
        displayName: authUser.displayName,
        carrierId: authUser.carrierId,
        role: authUser.role
      };

      req.session.save();

      logger.info('session saved', req.session);

      db.createSession(token);
      return res.json({ token: '__session__', user: authUser });
    });
  })(req, res, next);
});

router.post(SIGN_OUT, function(req, res) {
  let token = req.header('Authorization');

  if (token) {
    req.logout();
    db.revokeSession(token);
    return res.sendStatus(200);
  } else {
    return res.status(500).json({
      error: 'signout failed'
    });
  }
});

export default router;

