import express = require('express');
import Q = require('q');
var nconf = require('nconf');
var passport = require('passport');
var di = require('di');
var logger = require('winston');
///ts:import=portalUserManager

class Forgot {
  PortalUserManager;

  constructor(portalUserManager) {
    this.PortalUserManager = portalUserManager;
  }

  index(req: any, res: any, next: Function) {
    res.render('pages/forgotpassword', {
      title: req.i18n.t('forgotpassword:index.title'),
      body: req.i18n.t('forgotpassword:index.body')
    });
  }

  submit = (req: any, res: any, next: Function) => {

    var PortalUserManager = this.PortalUserManager;

    Q.ninvoke(PortalUserManager, "getUser", {username: req.body.username})
      .then(function(user: any) {
        // set reset password token
        if (!user) {
          throw new Error('user-not-found');
        }

        return Q.ninvoke(PortalUserManager, "makeForgotPasswordRequest", {user: user});
      })
      .then(function(user: any) {

        if (!user) {
          throw new Error('db-error');
        }

        // Prepare email contents
        var username = user.username;
        var token = user.token.forgotPassword.token;

        // Send email
      })
      .then(function() {
        req.flash('afterPost', true);
        res.redirect('/forgotpassword/success');
      })
      .catch(function(err) {
        req.flash('afterPost', true);
        req.flash('afterPostError', err.message);
        res.redirect('/forgotpassword/retry');
      });
  };

  retry(req: any, res: any, next: Function) {
    if (req.flash('afterPost')[0] === true) {

      var errorMessage = req.flash('afterPostError');

      res.render('pages/forgotpassword', {
        title: req.i18n.t('forgotpassword:fail.' + errorMessage + '.title'),
        body: req.i18n.t('forgotpassword:index.body'),
        message: req.i18n.t('forgotpassword:fail.' + errorMessage + '.message')
      });
    } else {
      res.redirect('/forgotpassword');
    }
  }

  success(req: any, res: any, next: Function) {
    if (req.flash('afterPost')[0] === true) {
      res.render('pages/forgotpassword-success', {
        title: req.i18n.t('forgotpassword:index.title')
      });
    } else {
      res.redirect('/forgotpassword');
    }
  }
}

di.annotate(Forgot, new di.Inject(portalUserManager));

export = Forgot;
