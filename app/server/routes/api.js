var di        = require('di');
var express   = require('express');
var passport  = require('passport');

var apiController     = require('app/server/api');
var CompanyController = require('app/server/api/company');

var ApiRouter = (function () {
    function ApiRouter(apiController, companyController) {
        var _router = express.Router();
        _router.get('/users', passport.ensureAuthenticated, apiController.getUsers);
        _router.post('/users', passport.ensureAuthenticated, apiController.newUser);
        _router.get('/companies', passport.ensureAuthenticated, companyController.getCompanies);
        _router.post('/companies', passport.ensureAuthenticated, companyController.newCompany);
        _router.put('/companies/:id', passport.ensureAuthenticated, companyController.updateCompany);
        return _router;
    }
    return ApiRouter;
})();
di.annotate(ApiRouter, new di.Inject(apiController, CompanyController));
module.exports = ApiRouter;
