/// <reference path='./../../typings/node/node.d.ts' />

var LocalStrategy = require('passport-local').Strategy;

// Models
var portalUser = require('./../user/models/PortalUser');

function initialize(portalUserManager) {
  var passport = require('passport');

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
    function (username:string, password:string, done) {
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
