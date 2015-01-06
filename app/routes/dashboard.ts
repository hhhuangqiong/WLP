import express = require('express');

var di = require('di');

var dashboardController = require('app/dashboard/controllers/dashboardController');

class DashboardRouter {

  constructor(dashboardController) {
    var _router = express.Router();
    _router.get('/', dashboardController.index);
    return _router;
  }
}

di.annotate(DashboardRouter, new di.Inject(dashboardController));

export = DashboardRouter;
