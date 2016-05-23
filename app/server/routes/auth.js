import logger from 'winston';
import passport from 'passport';
import { NotFoundError } from 'common-errors';

function signIn(req, res, next) {
  passport.authenticate('local', (err, user) => {
    if (err) {
      logger.error('error occurred in passport.js localStrategy', err);
      res.apiError(500, err);
      return;
    }

    if (!user) {
      const error = new NotFoundError('user');
      res.apiError(422, error);
      return;
    }

    req.logIn(user, loginErr => {
      if (loginErr) {
        logger.error('error occurred in req.logIn()', loginErr);
        res.apiError(500, loginErr);
        return;
      }

      /* eslint-disable no-param-reassign */
      req.session.data = user;
      req.session.save();
      /* eslint-enable no-param-reassign */

      logger.debug('session saved for %s', req.session.username);

      // eslint-disable-next-line no-use-before-define
      const { _id, ...attributes } = user;

      res.apiResponse(200, {
        data: {
          type: 'user',
          id: _id,
          attributes: { ...attributes },
        },
      });
    });
  })(req, res, next);
}

function signOut(req, res) {
  const { user } = req;
  const { username } = user;

  logger.debug('user: %s is logging out', username);

  try {
    req.logout();
  } catch (err) {
    logger.error('error occurred in req.logout()', err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
    return;
  }

  logger.debug('user: %s logged out successfully', username);

  res.status(200).json({
    success: true,
    user,
  });
}

function getSession(req, res) {
  logger.debug('loading session from express request');

  const { user } = req;

  if (!user) {
    logger.debug('user session not found, responding 200 with data of `null`');

    res.apiResponse(200, {
      data: null,
    });

    return;
  }

  logger.debug('user session detected, %j', user);

  // eslint-disable-next-line no-use-before-define
  const { _id: id, ...attributes } = user;

  res.apiResponse(200, {
    data: !!user ? {
      type: 'user',
      id,
      attributes: { ...attributes },
    } : null,
  });
}

export {
  signIn,
  signOut,
  getSession,
};
