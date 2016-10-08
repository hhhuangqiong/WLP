import passport from 'passport';
import nconf from 'nconf';
import { ArgumentNullError } from 'common-errors';

import { OpenIdStrategy } from '../openid/Strategy';

/**
 * Set up the de-/serializer for passport
 *
 * @return {Authenticator}
 */
export default function setup() {
  passport.serializeUser((data, done) => {
    done(null, {
      username: data.user.id,
      carrierId: data.user.carrierId,
      affiliatedCompany: data.user.affiliatedCompany,
      tokens: data.tokens,
    });
  });

  passport.deserializeUser((obj, done) => {
    done(null, obj);
  });

  // @todo: configurations should be injected
  const openIdConfig = nconf.get('openid');
  const appURL = nconf.get('APP_URL');

  if (!openIdConfig) {
    throw new ArgumentNullError('openIdConfig');
  }
  if (!appURL) {
    throw new ArgumentNullError('White label app url(APP_URL)');
  }
  // set up the open id strategy
  passport.use(new OpenIdStrategy({
    redirectURL: `${appURL}/callback`,
    postLogoutURL: appURL,
    ...openIdConfig,
  }, (tokens, user, cb) =>
    cb(null, { tokens, user })
  ));
  return passport;
}
