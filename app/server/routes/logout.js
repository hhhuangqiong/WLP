var express = require('express');
var di = require('di');
var logoutController = require('app/server/controllers/logout');
var LogoutRouter = (function () {
    function LogoutRouter(logoutController) {
        var _router = express.Router();
        _router.get('/', logoutController.logout);
        return _router;
    }
    return LogoutRouter;
})();
di.annotate(LogoutRouter, new di.Inject(logoutController));
module.exports = LogoutRouter;
