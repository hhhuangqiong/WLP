import express = require('express');
var passport   = require('passport');
var di         = require('di');
var CompanyController = require('app/server/controllers/company');

class CompanyRouter {

  constructor(companyController) {
     var _router = express.Router();


    _router.get('/',      companyController.index);
    _router.get('/companyHeader',companyController.companyHeader);
    _router.get('/form',companyController.new);
    _router.get('/edit',companyController.edit);
    return _router;
  }
}

di.annotate(CompanyRouter, new di.Inject(CompanyController));
export = CompanyRouter;
