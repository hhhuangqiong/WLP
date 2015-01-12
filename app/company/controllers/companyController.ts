/**
 * Created by ksh on 1/6/15.
 */
///ts:import=CompanyRepo,CompanyRepo
///ts:import=passport
import express = require('express');
var nconf = require('nconf');
var logger = require('winston');
import Mongoose = require('mongoose');
import Q = require('q');
var di=require('di');
var injector = new di.Injector([]);
var companyRepo = injector.get(CompanyRepo);
export class Company {
  constructor() {
  }

  index(req:any, res:any, next:Function) {
    res.render('pages/AddCompany', {title: 'Add Company'});
  }

  addCompany(req:any, res:any, next:Function) {
    var company = req.body;
    var user = req.user;
    var logo=req.files.logo;
    logger.info("Company data \n" + JSON.stringify(company));
    if (isVerified(company,logo)) {
      var finCompany = finalize(company, user._id,logo.name);
      logger.debug("Company object to be persisted :\n" + JSON.stringify(finCompany));
      companyRepo.add(finCompany).then(function (result) {
        res.render("pages/AddCompany",{notification:"Company Added successfully!"});
      }).fail(function (error) {
        logger.error("Error while persisting Company entity to DB:\n " + error);
        res.render('pages/errors/error', {message: "Error while persisting Company entity to DB:", error: error});
      }).done();
    } else {
      logger.error('Company object is not verified, will not be saved in the db\n' + company);
    }
  }
}


/**
 * Check if all elements needed for persisting the company is correct.
 * @param company
 * @returns {boolean}
 */
function isVerified(company:Object,file:Object):boolean {
  return true;
}

/**
 * Assemble and fill in missing data like create/updated at and created/updated by user
 * @param company
 * @param id
 * @returns {{name: any, address: any, reseller: any, domain: any, businessContact: {name: any, phone: any, email: any}, technicalContact: {name: any, phone: any, email: any}, supportContact: {name: any, phone: any, email: any}, createAt: Date, createBy: (user.id|any), updateAt: Date, updateBy: (user.id|any)}}
 */
function finalize(company, id:string,logo:string) {
  return {
    name: company.name,
    address: company.address,
    reseller: company.isReseller,
    domain: company.domain,
    businessContact: {name: company.bc_name, phone: company.bc_phone, email: company.bc_email},
    technicalContact: {name: company.tc_name, phone: company.tc_phone, email: company.tc_email},
    supportContact: {name: company.sc_name, phone: company.sc_phone, email: company.sc_email},
    logo: logo,
    createAt: new Date(),
    createBy:id,
    updateAt: new Date(),
    updateBy:id,
    supportedLanguages:company.languages,
    supportedDevices:company.devices
  }
}

