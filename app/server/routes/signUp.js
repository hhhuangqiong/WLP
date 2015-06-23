import { Router } from 'express';
import nconf      from 'nconf';
import Controller from '../controllers/signUp';
import { fetchContainerInstance } from '../utils/bottle';

module.exports = (function() {
  var ioc       = fetchContainerInstance(nconf.get('containerName'));
  var container = ioc.container;
  var c         = new Controller(container.PortalUserManager);

  return Router()
    .get('/signup',         c.verifyRequest, c.validateSignUpUser)
    .post('/signup/process', c.preSignUp, c.passwordStrengthTest, c.bounceBack);
}());
