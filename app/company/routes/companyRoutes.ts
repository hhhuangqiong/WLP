/**
 * Created by ksh on 1/6/15.
 */
import express = require('express');
var passport = require('passport');
import CompanyController = require('app/company/controllers/companyController')

var PermissionChecker = require('app/common/utilities/PermissionChecker')

var di = require('di');
/**
 * Responsible for handling all routes that deal with company operations.
 */
class CompanyRouter {

  constructor(CompanyController) {
     var _router = express.Router();
    _router.use(passport.ensureAuthenticated);
    _router.use(PermissionChecker.check);

//Company Creation
    _router.get('/new', CompanyController.index);
    _router.post('/', CompanyController.addCompany);
//List companies/company
    _router.get('/', CompanyController.fetchInfo);
    _router.get('/:id/edit', CompanyController.editForm);
    _router.put('/:id', CompanyController.updateRecord);
    _router.delete('/:id', CompanyController.deActivateRecord);
    return _router;
  }
}
di.annotate(CompanyRouter, new di.Inject(CompanyController));
export = CompanyRouter;
