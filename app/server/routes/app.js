import nconf from 'nconf';
import { fetchContainer } from 'app/server/initializers/ioc';

var express = require('express');
var di = require('di');
var passport = require('passport');
var appController = require('app/server/controllers/app');
var AppRouter = (function () {

    var ensureAuthenticated = fetchContainer(nconf.get('containerName'), 'middlewares.ensureAuthenticated');

    function AppRouter(appController) {
        var _router = express.Router();
        _router.get('/', ensureAuthenticated, appController.index);
        return _router;
    }
    return AppRouter;
})();
di.annotate(AppRouter, new di.Inject(appController));
module.exports = AppRouter;
