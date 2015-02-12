import { Router } from 'express';
import Controller from 'app/server/controllers/dashboard';

module.exports = (() => {
  var controller = new Controller();
  return Router().get('/', controller.index);
}());
