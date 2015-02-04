var express = require('express');
var di = require('di');
var loginController = require('app/server/controllers/login');
var LoginRouter = (function () {
    function LoginRouter(loginController) {
        var _router = express.Router();
        _router.get('/', loginController.login);
        _router.post('/', loginController.doLogin, loginController.postLogin);
        return _router;
    }
    return LoginRouter;
})();
di.annotate(LoginRouter, new di.Inject(loginController));
module.exports = LoginRouter;
