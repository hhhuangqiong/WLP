import logger from 'winston';
import passport from 'passport';

import sessionClient from '../initializers/sessionClient';

const sessionDebug = require('debug')('app:sessionFlow');

function getAuthUser(user) {
  const { _id, username, displayName } = user;
  const { carrierId, role } = user.affiliatedCompany || {};

  return { _id, username, displayName, carrierId, role };
}

function signIn(req, res, next) {
  passport.authenticate('local', (err, user) => {
    function signInError() {
      res.status(401).json({
        error: {
          message: 'Wrong username or password',
        },
      });
    }

    // TODO simplify this
    if (err || !user) {
      return signInError();
    }

    req.logIn(user, err => {
      if (err) {
        logger.error('failed during `req.logIn`', err);
        signInError();
        return;
      }

      // from 'express-session'
      const authUser = getAuthUser(user);
      const data = {
        user: authUser._id,
        username: authUser.username,
        displayName: authUser.displayName,
        carrierId: authUser.carrierId,
        role: authUser.role,
      };

      req.session.data = data;
      req.session.save();

      sessionClient.createSession(data, err => {
        if (err) {
          logger.error(err);
          next(err);
          return;
        }
      });

      logger.info('session saved for %s', req.session.username);

      res.json({ user: authUser });
    });
  })(req, res, next);
}

function signOut(req, res) {
  const { user } = req;

  try {
    req.logout();
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
    return;
  }

  res.status(200).json({
    success: true,
    user,
  });
}

export {
  signIn,
  signOut,
};
