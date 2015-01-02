/// <reference path='../typings/express/express.d.ts' />

import express = require('express');
var LogoutController = require('../app/controllers/logoutController');
var di = require('di');

class LogoutRouter {

  constructor(LogoutController) {

    var _router = express.Router();

    _router.get('/', LogoutController.logout);

    return _router;
  }
}

di.annotate(LogoutRouter, new di.Inject(LogoutController));

export = LogoutRouter;
