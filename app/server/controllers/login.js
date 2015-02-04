var logger = require('winston');
var di = require('di');
var nconf = require('nconf');
var passport = require('passport');
var protector = require('app/server/initializers/loginProtector');
var Login = (function () {
    function Login() {
    }
    Login.prototype.login = function (req, res, next) {
        if (req.isAuthenticated()) {
            res.redirect(nconf.get('landing:authenticated:path'));
        }
        else {
            res.render('pages/login', {
                title: req.i18n.t('login:login.title'),
                username: req.flash('username'),
                captcha: protector.needCaptcha(req),
                message: req.flash('error')
            });
        }
    };
    Login.prototype.doLogin = function (req, res, next) {
        passport.authenticate('local', function (err, user, info) {
            if (err) {
                return next(err);
            }
            if (!user) {
                return next(new Error(info.message));
            }
            if (!user.hasValidOneTimePassword(req.body.onetimepassword)) {
                return next(new Error('Invalid one time password'));
            }
            req.logIn(user, function (err) {
                if (err) {
                    logger.error(err);
                    return next(err);
                }
                next();
            });
        })(req, res, next);
    };
    Login.prototype.postLogin = function (req, res, next) {
        protector.postRequest(req, function (err) {
            if (req.body.rememberMe != 'on') {
                req.session.cookie.maxAge = 1000 * 60 * 15;
            }
            else {
                req.session.cookie.expires = false;
            }
            req.flash('username', req.body.username);
            if (req.isAuthenticated() || !err) {
                res.redirect(nconf.get('landing:authenticated:path'));
            }
            else {
                res.redirect(nconf.get('landing:unauthenticated:path'));
            }
        });
    };
    return Login;
})();
module.exports = Login;
