import express = require('express');

var di = require('di');
var passport = require('passport');

var appController = require('app/server/controllers/app');

class AppRouter {
  constructor(appController) {

    var _router = express.Router();

    _router.get('/', passport.ensureAuthenticated, appController.index);

    return _router;
  }
}

di.annotate(AppRouter, new di.Inject(appController));

export = AppRouter;
