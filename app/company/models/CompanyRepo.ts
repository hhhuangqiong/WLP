/**
 * Created by ksh on 1/6/15.
 */
import mongoose     = require('mongoose');

import repo         = require('app/common/models/repo');
import companyModel = require('app/company/models/companyModel')

   class CompanyRepo extends repo.Repos<companyModel.Company> {
    constructor() {
      super("Company", mongoose.connection, companyModel.CompanySchema());
    }
  }
export =CompanyRepo;
