import passport from 'passport';
import nconf from 'nconf';

import { OpenIdStrategy } from '../openid/Strategy';
import PortalUser from '../../collections/portalUser';
/**
 * Set up the de-/serializer for passport
 *
 * @return {Authenticator}
 */
export default function setup() {
  passport.serializeUser((data, done) => {
    done(null, {
      username: data.user.sub,
      tokens: data.tokens,
    });
  });

  passport.deserializeUser((obj, done) => {
    // @TODO update the flow to get the permission information based on the user id
    PortalUser
    .findOne({ username: obj.username })
    .populate('affiliatedCompany', 'carrierId role')
    .exec((err, user) => {
      if (err) {
        done(err);
        return;
      }

      if (!user) {
        done(new Error('user not found'));
        return;
      }

      try {
        // SHOULD NOT return the a mongoose document, but an object
        const userObject = user.toObject({ virtuals: true });
        userObject.tokens = obj.tokens;
        delete userObject.hashedPassword;
        delete userObject.salt;

        done(null, userObject);
      } catch (error) {
        done(error);
      }
    });
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
