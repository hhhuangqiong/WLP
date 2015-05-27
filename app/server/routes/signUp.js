import { Router } from 'express';
import nconf      from 'nconf';
import Controller from '../controllers/signUp';
import { fetchContainerInstance } from '../initializers/ioc';

module.exports = (() => {
  var ioc       = fetchContainerInstance( nconf.get('containerName') );
  var container = ioc.container;
  var c         = new Controller(container.PortalUserManager);

  return Router()
    .get('/',         c.verifyRequest, c.validateSignUpUser)
    .post('/process', c.preSignUp, c.passwordStrengthTest, c.bounceBack);
}());
