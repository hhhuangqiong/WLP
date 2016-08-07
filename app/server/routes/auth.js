import logger from 'winston';
import passport from 'passport';
import { signOut as openidSignOut, introspect } from '../openid/manager';

const signIn = passport.authenticate('openid-connect');
const signOut = openidSignOut;

function getSession(req, res) {
  logger.debug('loading session from express request');

  const { user } = req;

  if (!user || !user.tokens) {
    logger.debug('user session not found, responding 200 with data of `null`');
    // expect the user should logout and redirect to the sign in page.
    req.logout();
    res.apiResponse(200, {
      data: null,
    });
    return;
  }

  logger.debug('user session detected, %j', user);

  // check the openid access token
  introspect(user.tokens.access_token).then(details => {
    if (details.active) {
      // eslint-disable-next-line no-use-before-define
      const { _id: id, ...attributes } = user;
      res.apiResponse(200, {
        data: !!user ? {
          type: 'user',
          id,
          attributes: { ...attributes },
        } : null,
      });
      return;
    }
    // expect the user should logout and redirect to the sign in page.
    req.logout();
    // consider to be no user and redirect to login in client
    res.apiResponse(200, {
      data: null,
    });
  });
}

export {
  signIn,
  signOut,
  getSession,
};
