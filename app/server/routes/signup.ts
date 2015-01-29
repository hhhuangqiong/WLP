import express = require('express');

var di = require('di');

var signUpController = require('app/server/controllers/signUp');

class SignUpRouter {

  constructor(signUpController) {

    var _router = express.Router();

    _router.get('/', signUpController.preSignUp);
    _router.post('/process', signUpController.signUp);

    return _router;
  }
}

di.annotate(SignUpRouter, new di.Inject(signUpController));

export = SignUpRouter;
