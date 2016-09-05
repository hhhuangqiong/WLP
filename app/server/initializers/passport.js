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
  const issuer = nconf.get('openid:issuer');
  const clientID = nconf.get('openid:clientId');
  const clientSecret = nconf.get('openid:clientSecret');
  const appURL = nconf.get('APP_URL');

  if (!issuer) {
    throw new ArgumentNullError('Open Id issuer(openid:issuer)');
  }
  if (!clientID) {
    throw new ArgumentNullError('Open Id client id(openid:clientId)');
  }
  if (!clientSecret) {
    throw new ArgumentNullError('Open Id client secret(openid:clientSecret)');
  }
  if (!appURL) {
    throw new ArgumentNullError('White label app url(APP_URL)');
  }
  // set up the open id strategy
  passport.use(new OpenIdStrategy({
    issuer,
    clientID,
    clientSecret,
    redirectURL: `${appURL}/callback`,
    postLogoutURL: appURL,
  }, (tokens, user, cb) =>
    cb(null, { tokens, user })
  ));
  return passport;
}
