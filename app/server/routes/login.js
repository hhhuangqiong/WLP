import { Router } from 'express';
import Controller from 'app/server/controllers/login';

module.exports = (() => {
  // no deps, looks weird
  var controller = new Controller();

  return Router()
    .get('/', controller.login)
    .post('/', controller.doLogin, controller.postLogin);
}());
