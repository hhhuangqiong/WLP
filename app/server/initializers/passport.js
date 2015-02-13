import { Strategy as LocalStrategy } from 'passport-local';
import PortalUser from 'app/collections/portalUser';

/**
 * Set up the de-/serializer for passport
 *
 * @param {Object} portalUserManager
 * @return {Authenticator}
 */
export default function setup(portalUserManager) {
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
  passport.use('local', new LocalStrategy((username, password, done) => {
    portalUserManager.verifyUser(username, password, done);
  }));

  // Middleware
  passport.ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) return next();
    res.redirect('/login');
  };

  return passport;
}
