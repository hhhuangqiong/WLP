import { Router } from 'express';
import nconf      from 'nconf';
import Controller from 'app/server/controllers/signUp';
import { fetchContainerInstance } from 'app/server/initializers/ioc';

module.exports = (() => {
  var ioc       = fetchContainerInstance( nconf.get('containerName') );
  var container = ioc.container;
  var c         = new Controller(container.PortalUserManager);

  return Router()
    .get('/',         c.verifyRequest, c.validateSignUpUser, c.renderForm)
    .get('/invalid',  container.middlewares.flash, c.invalidSignUp)
    .post('/process', c.preSignUp, c.passwordStrengthTest, c.signUp, c.bounceBack);

}());
