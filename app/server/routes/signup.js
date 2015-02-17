import { Router } from 'express';
import nconf from 'nconf';

import Controller from 'app/server/controllers/signUp';
import { fetchContainer } from 'app/server/initializers/ioc';

module.exports = (() => {
  var container = fetchContainer(nconf.get('containerName'));
  var controller  = new Controller(container.userManager);

  return Router()
    .get('/',         controller.verifyRequest, controller.validateSignUpUser, controller.preSignUp)
    .get('/invalid',  container.middlewares.flash, controller.invalidSignUp)
    .post('/process', controller.signUp);

}());
