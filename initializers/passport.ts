var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

// Models
var portalUser = require('../models/portalUser').PortalModel;

passport.use('local', new LocalStrategy(function(username: string, password: string, done: any) {
    portalUser.findOne({ username: username }, function(err, user) {
        if (err) { return done(err) };
        if (!user) { return done(null, false, { message: 'Unknown user ' + username}) };
        console.log(user);
        done(err, user);
    });
}));

// Passport session setup
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    portalUser.findById(id, function (err, user) {
        done(err, user);
    });
});

// Middleware
passport.ensureAuthenticated = function(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login?location=' + encodeURIComponent(req.originalUrl));
}

export = passport;
