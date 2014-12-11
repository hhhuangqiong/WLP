/// <reference path='../../../typings/node/node.d.ts' />

/*
 * Module dependencies
 */

var passport = require('passport');
var PortalUser = require('../models/portalUser');
var LocalStrategy = require('passport-local').Strategy;

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    PortalUser.findById(id, function (err, user) {
        done(err, user);
    });
});

/*
 * Setup strategies
 */

passport.use('local', new LocalStrategy(
    function(username: string, password: string, done) {
        PortalUser.findOne({
            username: username
        }, function(err, user) {
            if (err) { return done(err) };
            if (!user || !user.isValidPassword(password)) {
                return done(null, false, {
                    message: 'Unknown user or invalid password'
                });
            }
            return done(null, user);
        })
}));

// Middleware
passport.ensureAuthenticated = function(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }

    res.redirect('/login');
}

export = passport;