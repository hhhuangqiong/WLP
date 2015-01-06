import express = require('express');

var di = require('di');

var logoutController = require('app/logout/controllers/logoutController');

class LogoutRouter {

  constructor(logoutController) {

    var _router = express.Router();
    _router.get('/', logoutController.logout);
    return _router;
  }
}

di.annotate(LogoutRouter, new di.Inject(logoutController));

export = LogoutRouter;
