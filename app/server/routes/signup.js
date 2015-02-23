import { Router } from 'express';
import nconf from 'nconf';

import Controller from 'app/server/controllers/signUp';
import { fetchContainer } from 'app/server/initializers/ioc';

module.exports = (() => {
  var container = fetchContainer(nconf.get('containerName'));
  var c         = new Controller(container.userManager);

  return Router()
    .get('/',         c.verifyRequest, c.validateSignUpUser, c.renderForm)
    .get('/invalid',  container.middlewares.flash, c.invalidSignUp)
    .post('/process', c.preSignUp, c.passwordStrengthTest, c.signUp, c.bounceBack);

}());
