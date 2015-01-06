/**
 * Created by ksh on 1/6/15.
 */
import express = require('express');
var passport = require('passport');
///ts:import=companyController,Controller
///ts:import

var di=require('di');

export class CompanyRouter{

  constructor(companyController){
    var _router=express.Router();

    _router.get('/',passport.ensureAuthenticated,companyController.index);
    _router.post('/',passport.ensureAuthenticated,companyController.addCompany);
    return _router;
  }
}

di.annotate(CompanyRouter, new di.Inject(Controller.Company));


