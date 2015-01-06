/// <reference path='../typings/express/express.d.ts' />

import express = require('express');
var LoginController = require('../app/login/controllers/loginController');
var di = require('di');

class LoginRouter {

  constructor(LoginController) {

    var _router = express.Router();

    _router.get('/', LoginController.login);
    _router.post('/', LoginController.doLogin, LoginController.postLogin);

    return _router;
  }
}

di.annotate(LoginRouter, new di.Inject(LoginController));

export = LoginRouter;
