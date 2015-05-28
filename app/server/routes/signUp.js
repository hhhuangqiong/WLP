import { Router } from 'express';
import nconf      from 'nconf';
import Controller from '../controllers/signUp';
import { fetchContainerInstance } from '../utils/bottle';

module.exports = (() => {
  var ioc       = fetchContainerInstance( nconf.get('containerName') );
  var container = ioc.container;
  var c         = new Controller(container.PortalUserManager);

  return Router()
    .get('/',         c.verifyRequest, c.validateSignUpUser)
    .post('/process', c.preSignUp, c.passwordStrengthTest, c.bounceBack);
}());
