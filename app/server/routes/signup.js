var express = require('express');
var di = require('di');
var signUpController = require('app/server/controllers/signUp');
var SignUpRouter = (function () {
    function SignUpRouter(signUpController) {
        var _router = express.Router();
        _router.get('/', signUpController.preSignUp);
        _router.post('/process', signUpController.signUp);
        return _router;
    }
    return SignUpRouter;
})();
di.annotate(SignUpRouter, new di.Inject(signUpController));
module.exports = SignUpRouter;
