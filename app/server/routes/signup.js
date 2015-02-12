import { Router } from 'express';
import nconf from 'nconf';

import Controller from 'app/server/controllers/signUp';
import { fetchContainer } from 'app/server/initializers/ioc';

module.exports = (() => {
  // DRY this with the one in 'forgotPassword' router
  var userManager = fetchContainer(nconf.get('containerName'), 'UserManager');
  var controller  = new Controller(userManager);

  return Router()
    .get('/',         controller.verifyRequest, controller.preSignUp)
    .post('/process', controller.signUp);
}());
