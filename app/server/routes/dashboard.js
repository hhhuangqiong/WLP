import { Router }         from 'express';
import nconf              from 'nconf';
import Controller         from 'app/server/controllers/dashboard';
import { fetchContainer } from 'app/server/initializers/ioc';

module.exports = (() => {
  var ensureAuthenticated = fetchContainer(nconf.get('containerName'), 'middlewares.ensureAuthenticated');
  var controller = new Controller();

  return Router().get('/', ensureAuthenticated, controller.index);
}());
