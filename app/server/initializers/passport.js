import { Strategy as LocalStrategy } from 'passport-local';
import PortalUser from 'app/collections/portalUser';

/**
 * Set up the de-/serializer for passport
 *
 * @return {Authenticator}
 */
export default function setup() {
  var passport = require('passport');

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  passport.deserializeUser((id, done) => {
    PortalUser.findById(id, (err, user) => {
      done(err, user);
    });
  });

  // Local strategy
  //TODO do i18n at this level?
  passport.use('local', new LocalStrategy((username, password, done) => {
    PortalUser.findOne({username: username}, (err, user) =>{
      // shamelessly copy from 'passport-local' example
      if (err) { return done(err); }
      if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
      if (!user.isValidPassword( password )) { return done(null, false, { message: 'Invalid password' }); }
      // TODO check if the user has been verified (i.e., isVerified === true)
      return done(null, user);
    });
  }));

  // TODO maybe extract this part into express middleware
  passport.ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) return next();
    res.redirect('/login');
  };

  return passport;
}
