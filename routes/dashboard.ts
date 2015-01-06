import express = require('express');
var DashboardController = require('../app/controllers/dashboardController');
var di = require('di');

class DashboardRouter {

  constructor(DashboardController) {

    var _router = express.Router();

    _router.get('/', DashboardController.index);

    return _router;
  }
}

di.annotate(DashboardRouter, new di.Inject(DashboardController));

export = DashboardRouter;
