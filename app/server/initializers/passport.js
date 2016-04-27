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
    done(null, user._id);
  });

  passport.deserializeUser((id, done) => {
    PortalUser
      .findById(id)
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

          delete userObject.hashedPassword;
          delete userObject.salt;

          done(null, userObject);
        } catch (error) {
          done(error);
        }
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

        // TODO other checkings e.g. verified, suspended, whitelisted, etc

        done(null, user);
      });
  }));

  return passport;
}
