var repo            = require('app/lib/repo');
import CompanyModel = require('app/lib/repo/company/model')

var di       = require('di');
var injector = new di.Injector([]);
var schema   = injector.get(CompanyModel.CompanySchema)

import mongoose=require('mongoose');

class CompanyRepo extends repo.Repos<CompanyModel.Company> {
  constructor() {
    super("Company", mongoose.connection,schema);
  }
}

export =CompanyRepo;
