import express = require('express');

var di = require('di');
var passport = require('passport');

var apiController = require('app/server/api');
var CompanyController = require('app/server/api/company');
class ApiRouter {

  constructor(apiController, companyController) {

    var _router = express.Router();

    _router.get('/users', passport.ensureAuthenticated, apiController.getUsers);
    _router.post('/users', passport.ensureAuthenticated, apiController.newUser);
    _router.get('/companies', passport.ensureAuthenticated, companyController.getCompanies);
    _router.post('/companies', passport.ensureAuthenticated, companyController.newCompany);
    _router.put('/companies/:id', passport.ensureAuthenticated, companyController.updateCompany);
    //_router.delete('companies/:id', passport.ensureAuthenticated, companyController.deactivateCompany);

    return _router;
  }
}

di.annotate(ApiRouter, new di.Inject(apiController, CompanyController));

export = ApiRouter;
