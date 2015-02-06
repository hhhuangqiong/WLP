var di      = require('di');
var express = require('express');

import EndUsersController from '../controllers/endUsers';

class EndUsersRouter {
  constructor(endUsersController) {

    let _router = express.Router();

    _router.get('/', endUsersController.test);

    return _router;
  }
}

di.annotate(EndUsersRouter, new di.Inject(EndUsersController));

export default EndUsersRouter;
