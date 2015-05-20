import { Router }   from 'express';
import nconf        from 'nconf';
import Controller   from '../controllers/forgotPassword';
import { fetchDep } from '../initializers/ioc';

module.exports = (() => {
  var controller  = new Controller(fetchDep(nconf.get('containerName'), 'PortalUserManager'));

  return Router()
    .post('/', controller.submit)
    .get('/success', controller.success)
    .get('/retry', controller.retry);
})();
