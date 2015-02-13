import nconf from 'nconf';
import { fetchContainer } from 'app/server/initializers/ioc';

var di        = require('di');
var express   = require('express');
var passport  = require('passport');

var apiController     = require('app/server/api');
var CompanyController = require('app/server/api/company');

var ApiRouter = (function () {
    var ensureAuthenticated = fetchContainer(nconf.get('containerName'), 'middlewares.ensureAuthenticated');

    function ApiRouter(apiController, companyController) {
        var _router = express.Router();
        _router.get('/users',         ensureAuthenticated, apiController.getUsers);
        _router.post('/users',        ensureAuthenticated, apiController.newUser);
        _router.get('/companies',     ensureAuthenticated, companyController.getCompanies);
        _router.post('/companies',    ensureAuthenticated, companyController.newCompany);
        _router.put('/companies/:id', ensureAuthenticated, companyController.updateCompany);
        return _router;
    }
    return ApiRouter;
})();
di.annotate(ApiRouter, new di.Inject(apiController, CompanyController));
module.exports = ApiRouter;
