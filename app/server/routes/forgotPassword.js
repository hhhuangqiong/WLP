import { Router } from 'express';
import nconf from 'nconf';

import Controller from 'app/server/controllers/forgotPassword';
import { fetchContainer } from 'app/server/initializers/ioc';

module.exports = (() => {
  var userManager = fetchContainer(nconf.get('containerName'), 'UserManager');
  var controller  = new Controller(userManager);

  return Router()
    .get('/', controller.index)
    .post('/', controller.submit)
    .get('/success', controller.success)
    .get('/retry', controller.retry);
})();
