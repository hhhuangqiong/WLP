import { Router }   from 'express';
import nconf        from 'nconf';
import Controller   from '../controllers/dashboard';
import { fetchDep } from '../initializers/ioc';

module.exports = (() => {
  var ensureAuthenticated = fetchDep(nconf.get('containerName'), 'middlewares.ensureAuthenticated');
  var controller = new Controller();

  return Router().get('/', ensureAuthenticated, controller.index);
}());
