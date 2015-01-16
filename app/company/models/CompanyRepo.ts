/**
 * Created by ksh on 1/6/15.
 */
var repo = require('app/common/models/repo');
var companyModel =require('app/company/models/companyModel')

import mongoose=require('mongoose');

   class CompanyRepo extends repo.Repos<companyModel.Company> {
    constructor() {
      super("Company", mongoose.connection, companyModel.CompanySchema());
    }
  }
export =CompanyRepo;
