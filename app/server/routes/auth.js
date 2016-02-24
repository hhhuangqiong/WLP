import logger from 'winston';
import passport from 'passport';

import sessionClient from '../initializers/sessionClient';

const sessionDebug = require('debug')('app:sessionFlow');

function getAuthUser(user) {
  const { _id, username, displayName } = user;
  const { carrierId, role } = user.affiliatedCompany || {};

  return { _id, username, displayName, carrierId, role };
}

const signIn = function (req, res, next) {
  passport.authenticate('local', function (err, user, info) {
    const signInError = function () {
      return res.status(401).json({
        error: {
          message: 'Wrong username or password',
        },
      });
    };

    // TODO simplify this
    if (err || !user) {
      return signInError();
    }

    req.logIn(user, function (err) {
      if (err) {
        logger.error('failed during `req.logIn`', err);
        return signInError();
      }

      // from 'express-session'
      const token = req.sessionID;
      const authUser = getAuthUser(user);
      const data = {
        token: token,
        user: authUser._id,
        username: authUser.username,
        displayName: authUser.displayName,
        carrierId: authUser.carrierId,
        role: authUser.role,
      };

      req.session.data = data;
      req.session.save();

      sessionClient.createSession(data, function (err) {
        if (err) {
          logger.error(err);
          return next(err);
        }
      });

      logger.info('session saved for %s', req.session.username);

      return res.json({ token: '__session__', user: authUser });
    });
  })(req, res, next);
};

const signOut = function (req, res) {
  let token = req.header('Authorization');

  if (token === '__session__') {
    // from client
    token = req.sessionID;
  }

  if (token) {
    req.logout();
    sessionClient.revokeSession(token);
    return res.sendStatus(200);
  }

  return res.status(500).json({
    error: 'signout failed',
  });
};

// because the app doesn't redirect the user after log in
// NB: cannot use `req.isAuthenticated` (passport)
// so there's no 'user' in `req` object
const ensureAuthenticated = function (req, res) {
  return res.sendStatus(200);
};

const validateToken = function (req, res, next) {
  sessionDebug('Auth Header ', req.header('Authorization'));
  let token = req.header('Authorization');

  if (token === '__session__') {
    // from client
    token = req.sessionID;
  }

  sessionClient.getSession(token)
    .then((user) => {
      if (!user || ((user && user.token) !== token)) {
        return res.status(401).json({
          error: {
            message: 'Must provide valid auth token in Authorization header',
          },
        });
      }

      // prepare the user object just like what
      // Passport.js does to req.user
      res.locals.user = user;
      return next();
    })
    .catch(err => {
      logger.error(err);
      return res.status(500).json({
        error: err,
      });
    })
    .done();
};

export {
  signIn,
  signOut,
  ensureAuthenticated,
  validateToken,
};
