import express = require('express');
var nconf = require('nconf');
var logger = require('winston');
import Mongoose = require('mongoose');
import Q = require('q');
var di = require('di');
var injector = new di.Injector([]);
var CompanyRepo = require('app/company/models/CompanyRepo')
var companyRepo = injector.get(CompanyRepo);
var ERRORPAGE = 'pages/errors/error';
class Company {
  constructor() {
  }

  index(req:any, res:any, next:Function) {
    res.render('pages/companies/new', {title: 'Add Company'});
  }

  addCompany(req:any, res:any, next:Function) {
    var data = getData(req);
    exec('add', data.company, null).then((result)=> {
      fulfilled(res, {notification: "Company Added Successfully"}, 'pages/companies/new');
    }).fail((error)=> {
      rejected(res, error, null);
    }).done();
  }

  fetchInfo = (req:any, res:any, next:Function) => {
    var criteria = this.getCriteria(req.query);
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
    var data = getData(req);
    exec('find', {_id: data.params.id}, null).then(function (result) {
      fulfilled(res, result[0], 'pages/companies/editcompany');
    }).fail(function (error) {
      rejected(res, error, null);
    }).done();
  }

  updateRecord(req:any, res:any, next:Function) {
    var data = getData(req);
    var criteria = {_id: data.params.id};
    exec('update', criteria, data.company).then(function (result) {
      return exec('find', criteria, null);
    }).then(function (result) {
      fulfilled(res, result, 'pages/companies/index');
    }).fail(function (error) {
      rejected(res, error, null);
    }).done();

  }

  deActivateRecord(req:any, res:any, next:Function) {
    var id = req.params.id;
    var criteria = {_id: id};
    exec('update', criteria, {status: 'inactive'}).then(function (result) {
      return exec('find', criteria, null);
    }).then(function (result) {
      fulfilled(res, result, 'pages/companies/index');
    }).fail(function (error) {
      rejected(res, error, null);
    }).done();
  }

  private getCriteria(params:any):any {
    var criteria:any = {};
    if (params) {
      if (params.id) {
        criteria._id = params.id
      }
      if (params.name) {
        criteria.name = params.name;
      }
      if (params.address) {
        criteria.address = params.address
      }
      if (params.domain) {
        criteria.domain = params.domain
      }
    }
    logger.info(json(criteria));
    return criteria;
  }


//end of class
}
export=Company;

function fulfilled(res, result, page) {
  logger.debug("Request has been processed successfully\nResult: " + json(result));
  goto(res, result, page);
}

function rejected(res, error, next) {
  logger.error("Error while processing Request\n", json(error));
  if (next) {
    next();
  } else {
    goto(res, error, ERRORPAGE);
  }
}

function getCompany(companyData) {
  return {
    name: companyData.name,
    address: companyData.address,
    reseller: companyData.isReseller,
    domain: companyData.domain,
    businessContact: {name: companyData.bc_name, phone: companyData.bc_phone, email: companyData.bc_email},
    technicalContact: {name: companyData.tc_name, phone: companyData.tc_phone, email: companyData.tc_email},
    supportContact: {name: companyData.sc_name, phone: companyData.sc_phone, email: companyData.sc_email},
    supportedLanguages: companyData.languages,
    supportedDevices: companyData.devices
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
    logger.debug("Serving " + page + " with the following data\n" + json(result));
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
/**
 * Fetching request data from req object
 * @param req
 * @returns {any}
 */
function getData(req:any):any {
  var data:any = {};
  var company:any = {};

//Fetching Requester information
  if (req.user) {
    data.user = req.user
  }
  //Fetching request parameters
  if (req.params) {
    data.params = req.params
    var methods = req.route.methods;
    if (methods.put || methods.post) {
      //If there is a body
      if (req.body) {
        company = getCompany(req.body);
      }
      company.updateBy = data.user._id;
      company.updateAt = new Date();
    }
    if (methods.post) {
      company.createBy = data.user._id;
      company.createAt = new Date();
    }
  }
  if (req.files && req.files.logo) {
    data.logo = req.files.logo;
    company.logo = data.logo.name;
  }
  data.company = company;
  return data;
}
/**
 * Shortcut for JSON.stringify.
 * @param obj
 * @returns {any}
 */
function json(obj:any):string {
  return JSON.stringify(obj);
}

