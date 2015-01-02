import express = require('express');
var nconf = require('nconf');
var passport = require('passport');
var Q = require('q');
var di = require('di');
var protector = require('../initializers/loginProtector');
var logger = require('winston');

class Login {
  constructor() {
  }

  login(req: any, res: express.Response, next: Function) {
    if (req.isAuthenticated()) {
      res.redirect(nconf.get('landing:authenticated:path'))
    } else {
      res.render('pages/login', {
        title: req.i18n.t('login:login.title'),
        username: req.flash('username'),
        captcha: protector.needCaptcha(req),
        message: req.flash('error')
      });
    }
  }

  doLogin(req: any, res: express.Response, next: Function) {
    passport.authenticate('local', function(err, user, info) {
      if (err) {
        return next(err);
      }
      if (!user) {
        return next();
      }
      req.logIn(user, function(err) {
        if (err) {
          logger.error(err);
          return next(err);
        }
        next();
      });
    })(req, res, next);
  }

  postLogin(req: any, res: express.Response, next: Function) {

    protector.postRequest(req, function(err) {
      if (req.body.rememberMe != 'on') {
        req.session.cookie.maxAge = 1000 * 60 * 15;
      } else {
        req.session.cookie.expires = false;
      }

      req.flash('username', req.body.username);

      if (req.isAuthenticated() || !err) {
        res.redirect(nconf.get('landing:authenticated:path'));
      } else {
        res.redirect(nconf.get('landing:unauthenticated:path'));
      }
    });
  }
}

export = Login;
