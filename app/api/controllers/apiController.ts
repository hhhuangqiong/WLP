import express  = require('express');
import logger   = require('winston');
import Q        = require('q');

var di = require('di');

var portalUserManager = require('app/user/services/portalUserManager');

class Api {
  PortalUserManager;

  constructor(portalUserManager) {
    this.PortalUserManager = portalUserManager;
  }

  getUsers = (req: any, res: express.Response, next: Function) => {
    var PortalUserManager = this.PortalUserManager;
    var conditions = [];

    Q.ninvoke(PortalUserManager, 'getUsers', conditions)
      .then(function(users) {
        res.json({
          "result": users ? true : false,
          "users": users
        });
      })
      .catch(function(err) {
        logger.error('Database error', err.stack);
        res.json({
          "result": false
        });
      });
  };

  newUser = (req: any, res: express.Response, next: Function) => {
    var PortalUserManager = this.PortalUserManager;
    var conditions = req.body;
    var author = req.user;

    // user hasn't logged in
    if (!req.user) {
      res.json({
        "result": false
      })
    }

    Q.ninvoke(PortalUserManager, 'newUser', conditions, author)
      .then(function(user) {
        res.json({
          "result": user ? true : false,
          "user": user
        })
      })
      .catch(function(err) {
        logger.error(err, 'db-error');
        res.json({
          "result": false
        });
      });
  };
}

di.annotate(Api, new di.Inject(portalUserManager));

export = Api;
