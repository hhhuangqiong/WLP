import express      = require('express');
import Mongoose     = require('mongoose');
import Q            = require('q');

var _               = require('underscore');
var nconf           = require('nconf');
var logger          = require('winston');
var di              = require('di');
var injector        = new di.Injector([]);
var companyRepo     = injector.get(CompanyRepo);

import CompanyModel = require('app/lib/repo/company/model');
var CompanyRepo     = require('app/lib/repo/company');

var ERRORPAGE       = 'pages/errors/error';

class Company {
  constructor() { }

  index(req:any, res:any, next:Function) {
    res.render('pages/companies/new', {title: 'Add Company'});
  }

  addCompany(req:any, res:any, next:Function) {
//Fetching company data
    var user = req.user;
    var company:any;
    company = getCompany(req.body);
    company.updateBy = user._id;
    company.parentCompany = user.affiliatedCompany;
    company.createBy = user._id;
    company.createAt = new Date();
//End
    exec('add', company, null).then((result)=> {
      fulfilled(res, {notification: "Company Added Successfully"}, 'pages/companies/new');
    }).fail((error)=> {
      rejected(res, error, null);
    }).done();
  }


  fetchInfo = (req:any, res:any, next:Function) => {
    var criteria = this.getCriteria(req.query);
    criteria.parentCompany = req.user.affiliatedCompany;

    var page = 'pages/companies/index';
    exec('find', criteria, null).then((result)=> {
      fulfilled(res, result, page);
    }).fail((error)=> {
      rejected(res, error, ()=> {
        goto(res, [], page)
      })
    }).done();
  }

  editForm(req:any, res:any, next:Function) {
    var criteria = {_id: req.params.id, parentCompany: req.user.affiliatedCompany};
    exec('find', criteria, null).then(function (result) {
//Can't find required id
      if (!result || result.length == 0) {
        throw new Error("Can't find entity with id " + req.params.id + " to edit.");
      }
      fulfilled(res, result[0], 'pages/companies/editcompany');
    }).fail(function (error) {
      rejected(res, error, null);
    }).done();
  }

  updateRecord(req:any, res:any, next:Function) {
//Get company data from request
    var company:any;
    company= getCompany(req.body);
    company.updateBy = req.user._id;

    var criteria = {_id: req.params.id, parentCompany: req.user.affiliatedCompany};
    exec('update', criteria, company).then(function (result) {
      return exec('find', criteria, null);
    }).then(function (result) {
      fulfilled(res, result, 'pages/companies/index');
    }).fail(function (error) {
      rejected(res, error, null);
    }).done();

  }

  deActivateRecord(req:any, res:any, next:Function) {

    var criteria = {_id: req.params.id, parentCompany: req.user.affiliatedCompany};
    exec('update', criteria, {status: 'inactive'}).then(function (result) {
      return exec('find', criteria, null);
    }).then(function (result) {
      fulfilled(res, result, 'pages/companies/index');
    }).fail(function (error) {
      rejected(res, error, null);
    }).done();
  }

  /**
   *Only used in the fetchInfo Method to allow search by name, address,domain, and ID.
   * @param params
   * @returns {any}
   */
  //TODO: need to refactor it to a simpler method
  private getCriteria(params:any):any {
    var criteria:any = {};
    for (var key in params) {
      //These are the current valid search criteria
      switch (key) {
        case "id":
        case "domain":
        case "name":
        case "address":
          if (!_.isNull(params[key]) && !_.isUndefined(params[key])) {
            criteria[key] = params[key];
          }
        default:
          logger.warn("Invalid search criteria requested: " + key);
      }
    }
    logger.debug("Requested search criteria: %j", criteria, {});
    return criteria;
  }

//end of class
}
export=Company;

function fulfilled(res, result, page) {
  logger.debug("Request has been processed successfully\nResult: %j ", result, {});
  goto(res, result, page);
}

function rejected(res, error, next) {
  logger.error("Error while processing Request\n %j ", error, {});
  if (next) {
    next();
  } else {
    goto(res, error, ERRORPAGE);
  }
}

function getCompany(requestBody) {
  return {
    accountManager: requestBody.accountManager,
    billCode: requestBody.billCode,
    //name: requestBody.name,
    address: requestBody.address,
    reseller: requestBody.isReseller,
    domain: requestBody.domain,
    businessContact: {name: requestBody.bc_name, phone: requestBody.bc_phone, email: requestBody.bc_email},
    technicalContact: {name: requestBody.tc_name, phone: requestBody.tc_phone, email: requestBody.tc_email},
    supportContact: {name: requestBody.sc_name, phone: requestBody.sc_phone, email: requestBody.sc_email},
    supportedLanguages: requestBody.languages,
    supportedDevices: requestBody.devices,
    updateAt: new Date()
  }
}
/**
 * render the requested page
 * @param page
 * @param data
 * @param res
 */
function goto(res:any, data:any, page:string) {
  if (page != ERRORPAGE) {
    var result:any = {};
    if (data) {
      result = {result: data};
    }
    logger.debug("Serving " + page + " with the following data\n %j", result, {});
    res.render(page, result);
  }
  else {
    res.render(ERRORPAGE, {message: "Error while processing request", error: data});
  }
}
/**
 * Executing query operation.
 * @param op operation {find,update,add,delete...}
 * @param criteria
 * @param opt optional parameter, used in update to provide the updated entity to be persisted.
 * @returns {any}
 */
function exec(op:string, criteria:any, opt:any) {
  logger.debug("Executing " + op + " request \nCriteria: ", criteria, "\nOptions:", opt);
  return companyRepo[op](criteria, opt);
}
