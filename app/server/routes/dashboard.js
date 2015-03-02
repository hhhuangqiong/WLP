import { Router }   from 'express';
import nconf        from 'nconf';
import Controller   from 'app/server/controllers/dashboard';
import { fetchDep } from 'app/server/initializers/ioc';

module.exports = (() => {
  var ensureAuthenticated = fetchDep(nconf.get('containerName'), 'middlewares.ensureAuthenticated');
  var controller = new Controller();

  return Router().get('/', ensureAuthenticated, controller.index);
}());
