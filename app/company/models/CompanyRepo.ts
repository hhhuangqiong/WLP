/**
 * Created by ksh on 1/6/15.
 */
///ts:import=companyModel
///ts:import=repo
import mongoose=require('mongoose');

   class CompanyRepo extends repo.Repos<companyModel.Company> {
    constructor() {
      super("Company", mongoose.connection, companyModel.CompanySchema());
    }
  }
export =CompanyRepo;
