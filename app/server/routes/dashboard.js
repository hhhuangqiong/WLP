var express = require('express');
var di = require('di');
var dashboardController = require('app/server/controllers/dashboard');
var DashboardRouter = (function () {
    function DashboardRouter(dashboardController) {
        var _router = express.Router();
        _router.get('/', dashboardController.index);
        return _router;
    }
    return DashboardRouter;
})();
di.annotate(DashboardRouter, new di.Inject(dashboardController));
module.exports = DashboardRouter;
