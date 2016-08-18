import passport from 'passport';
import nconf from 'nconf';

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

  // set up the open id strategy
  passport.use(new OpenIdStrategy({
    issuer: nconf.get('openid:issuer'),
    clientID: nconf.get('openid:clientId'),
    clientSecret: nconf.get('openid:clientSecret'),
    redirectURL: `${nconf.get('APP_URL')}/callback`,
    postLogoutURL: nconf.get('APP_URL'),
  }, (tokens, user, cb) =>
    cb(null, { tokens, user })
  ));
  return passport;
}
