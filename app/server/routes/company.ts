import express = require('express');
var passport   = require('passport');
var di         = require('di');

import CompanyController = require('app/server/controllers/company');
var PermissionChecker    = require('app/server/middlewares/PermissionChecker');

class CompanyRouter {

  constructor(CompanyController) {
     var _router = express.Router();
    _router.use(passport.ensureAuthenticated);
    _router.use(PermissionChecker.check);

    _router.get('/new',      CompanyController.index);
    _router.post('/',        CompanyController.addCompany);
    _router.get('/',         CompanyController.fetchInfo);
    _router.get('/:id/edit', CompanyController.editForm);
    _router.put('/:id',      CompanyController.updateRecord);
    _router.delete('/:id',   CompanyController.deActivateRecord);
    return _router;
  }
}

di.annotate(CompanyRouter, new di.Inject(CompanyController));
export = CompanyRouter;
