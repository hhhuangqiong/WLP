import { Strategy as LocalStrategy } from 'passport-local';
import PortalUser from '../../collections/portalUser';
import passport from 'passport';

/**
 * Set up the de-/serializer for passport
 *
 * @return {Authenticator}
 */
export default function setup() {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    PortalUser
      .findById(id)
      .populate('affiliatedCompany', 'carrierId')
      .exec((err, user) => {
        done(err, user);
      });
  });

  // TODO do i18n at this level?
  passport.use('local', new LocalStrategy((username, password, done) => {
    PortalUser
      .findOne({ username })
      .populate('affiliatedCompany')
      .exec((err, user) => {
        // shamelessly copy from 'passport-local' example
        if (err) {
          done(err);
          return;
        }

        if (!user) {
          done(null, false, { message: `Unknown user ${username}` });
          return;
        }

        if (!user.isValidPassword(password)) {
          done(null, false, { message: 'Invalid password' });
          return;
        }

        // TODO check if the user has been verified (i.e., isVerified === true)
        done(null, user);
      });
  }));

  return passport;
}
