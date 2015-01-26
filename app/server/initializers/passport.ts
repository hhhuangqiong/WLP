var LocalStrategy = require('passport-local').Strategy;

import portalUser = require('app/lib/repo/portalUser/model');

function initialize(PortalUserManager) {
  var passport = require('passport');
  var portalUserManager = new PortalUserManager();

  // Passport session setup
  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function (id, done) {
    portalUser.findById(id, function (err, user) {
      done(err, user);
    });
  });

  /*
   * Setup strategies
   */
  passport.use('local', new LocalStrategy(
    function (username:string, password:string, done: Function) {
      portalUserManager.verifyUser(username, password, done);
    }));

  // Middleware
  passport.ensureAuthenticated = function (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }

    res.redirect('/login');
  };

  return passport;
}

export = initialize;
