import { Router } from 'express';
import Controller from '../controllers/login';

module.exports = (() => {
  // no deps?
  var controller = new Controller();

  return Router()
    .post('/', controller.doLogin, controller.postLogin);
}());
