import express = require('express');
import logger  = require('winston');
import Q       = require('q');

var di                = require('di');
var portalUserManager = require('app/lib/portal/UserManager');

class Accounts {
  PortalUserManager;

  constructor(portalUserManager) {
    this.PortalUserManager = portalUserManager;
  }

  index = (req: any, res: any, next: Function) => {
    res.render('pages/accounts/index');
  };

  account(req: any, res: any, next: Function) {
    res.render('pages/accounts/account');
  }

  accountHeader(req: any, res: any, next: Function) {
    res.render('pages/accounts/header');
  }

  form(req: any, res: any, next: Function) {
    res.render('pages/accounts/form');
  }

  showEditForm(req: any, res: any, next: Function) {
    res.render('pages/accounts/edit', {});
  }

  // Server side rending - Abandoned
  /*
  createUser = (req: any, res: any, next: Function) => {
    var PortalUserManager = this.PortalUserManager;

    var data = {
      name: {
        first: req.body.firstname,
        last: req.body.lastname
      },
      username: req.body.email,
      carrierDomain: req.body.carrier,
      assignedGroup: req.body.groups,
      createAt: new Date(),
      createBy: req.session._userId,
      updateAt: new Date(),
      updateBy: req.session._userId
    };

    Q.ninvoke(PortalUserManager, 'addNewUser', data)
      .then(function(user: any) {
        if (!user) {
          throw new Error('db-error');
        }

        // send email
      })
      .then(function(err) {
        res.redirect('/accounts');
      })
      .catch(function(err) {
        logger.error(err);
        res.redirect('/accounts');
      })
  }
  */
}

di.annotate(Accounts, new di.Inject(portalUserManager));

export = Accounts;
