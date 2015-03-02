import { Router }   from 'express';
import nconf        from 'nconf';
import Controller   from 'app/server/controllers/forgotPassword';
import { fetchDep } from 'app/server/initializers/ioc';

module.exports = (() => {
  var controller  = new Controller(fetchDep(nconf.get('containerName'), 'PortalUserManager'));

  return Router()
    .get('/', controller.index)
    .post('/', controller.submit)
    .get('/success', controller.success)
    .get('/retry', controller.retry);
})();
