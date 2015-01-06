import express = require('express');
var di = require('di');
///ts:import=portalUserManager
///ts:import=forgotPasswordController,ForgotPasswordController

class ForgotPasswordRouter {

  constructor(ForgotPasswordController) {

    var _router = express.Router();

    _router.get('/', ForgotPasswordController.index);
    _router.post('/', ForgotPasswordController.submit);

    _router.get('/success', ForgotPasswordController.success);
    _router.get('/retry', ForgotPasswordController.retry);

    return _router;
  }
}

di.annotate(ForgotPasswordRouter, new di.Inject(ForgotPasswordController));

export = ForgotPasswordRouter;
