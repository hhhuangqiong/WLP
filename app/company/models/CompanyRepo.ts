/**
 * Created by ksh on 1/6/15.
 */
import repo = require('app/common/models/repo');
import CompanyModel =require('app/company/models/companyModel')
var di = require('di');
var injector = new di.Injector([]);
var schema = injector.get(CompanyModel.CompanySchema)


import mongoose=require('mongoose');

   class CompanyRepo extends repo.Repos<CompanyModel.Company> {
    //constructor(schema:mongoose.Schema) {
      constructor() {
      super("Company", mongoose.connection,schema);
    }
  }
export =CompanyRepo;
