import { Router }   from 'express';
import nconf        from 'nconf';
import Controller   from '../controllers/forgotPassword';
import { fetchDep } from '../utils/bottle';

module.exports = (() => {
  var controller  = new Controller(fetchDep(nconf.get('containerName'), 'PortalUserManager'));

  return Router().post('/forgot-password', controller.submit)
})();
