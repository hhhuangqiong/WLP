/**
 * Created by ksh on 1/6/15.
 */
import express = require('express');
var passport = require('passport');
///ts:import=companyController,Controller
///ts:import=PermissionChecker

var di = require('di');

export class CompanyRouter {

  constructor(companyController) {
    var _router = express.Router();
    _router.use(passport.ensureAuthenticated);
    _router.use(PermissionChecker.check);


    _router.get('/new', companyController.index);
    _router.post('/', companyController.addCompany);
    //_router.get(companyController.list);
    //_router.get('/:id/edit',companyController.editCompany);
    //_router.delete('/:id',companyController.deleteCompany);
    return _router;
  }
}

di.annotate(CompanyRouter, new di.Inject(Controller.Company));


