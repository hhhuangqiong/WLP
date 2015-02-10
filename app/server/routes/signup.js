var di         = require('di');
var express    = require('express');
var controller = require('app/server/controllers/signUp');

var SignUpRouter = (controller) => {
  var _router = express.Router();
  _router.get('/',         controller.verifyRequest, controller.preSignUp);
  _router.post('/process', controller.signUp);
  return _router;
}

di.annotate(SignUpRouter, new di.Inject(controller));
module.exports = SignUpRouter;
