import express = require('express');

var di              = require('di');
var loginController = require('app/server/controllers/login');

class LoginRouter {

  constructor(loginController) {

    var _router = express.Router();

    _router.get('/', loginController.login);
    _router.post('/', loginController.doLogin, loginController.postLogin);

    return _router;
  }
}

di.annotate(LoginRouter, new di.Inject(loginController));

export = LoginRouter;
