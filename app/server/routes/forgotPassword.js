var express = require('express');
var di = require('di');
var forgotPasswordController = require('app/server/controllers/forgotPassword');
var ForgotPasswordRouter = (function () {
    function ForgotPasswordRouter(forgotPasswordController) {
        var _router = express.Router();
        _router.get('/', forgotPasswordController.index);
        _router.post('/', forgotPasswordController.submit);
        _router.get('/success', forgotPasswordController.success);
        _router.get('/retry', forgotPasswordController.retry);
        return _router;
    }
    return ForgotPasswordRouter;
})();
di.annotate(ForgotPasswordRouter, new di.Inject(forgotPasswordController));
module.exports = ForgotPasswordRouter;
