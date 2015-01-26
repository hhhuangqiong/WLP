import express = require('express');

var di = require('di');
var passport = require('passport');

var apiController = require('app/server/api');

class ApiRouter {

  constructor(apiController) {

    var _router = express.Router();

    _router.get('/users', passport.ensureAuthenticated, apiController.getUsers);
    _router.post('/users', passport.ensureAuthenticated, apiController.newUser);

    return _router;
  }
}

di.annotate(ApiRouter, new di.Inject(apiController));

export = ApiRouter;
