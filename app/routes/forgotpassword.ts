import express = require('express');

var di = require('di');

var forgotPasswordController = require('app/forgotPassword/controllers/forgotPasswordController')

class ForgotPasswordRouter {

  constructor(forgotPasswordController) {

    var _router = express.Router();

    _router.get('/', forgotPasswordController.index);
    _router.post('/', forgotPasswordController.submit);

    _router.get('/success', forgotPasswordController.success);
    _router.get('/retry', forgotPasswordController.retry);

    return _router;
  }
}

di.annotate(ForgotPasswordRouter, new di.Inject(forgotPasswordController));

export = ForgotPasswordRouter;
