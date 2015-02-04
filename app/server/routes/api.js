var express = require('express');
var di = require('di');
var passport = require('passport');
var apiController = require('app/server/api');
var ApiRouter = (function () {
    function ApiRouter(apiController) {
        var _router = express.Router();
        _router.get('/users', passport.ensureAuthenticated, apiController.getUsers);
        _router.post('/users', passport.ensureAuthenticated, apiController.newUser);
        return _router;
    }
    return ApiRouter;
})();
di.annotate(ApiRouter, new di.Inject(apiController));
module.exports = ApiRouter;
