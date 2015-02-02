import express  = require('express');
import logger   = require('winston');
import Q        = require('q');

var di = require('di');
var Company = require('app/collections/company');
//var companyRepo = new Company();
class CompanyApi {
  getCompanies = (req:any, res:express.Response, next:Function)=> {
    var criteria = this.getCriteria(req.params);
    Q.ninvoke(Company, 'find', criteria).then((companies)=> {
      fulfilled(res, companies);
    }).fail((error)=> {
      rejected(res, error);
    }).done();
  }

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

  newCompany = (req:any, res:express.Response, next:Function)=> {
    //Fetching companies data
    var user = req.user;
    var company:any;
    company = getCompany(req.body);
    company.updateBy = user._id;
    company.parentCompany = user.affiliatedCompany;
    company.createBy = user._id;
    company.createAt = new Date();
    //End
    logger.debug("Initiate persisting request for :%j", company, {});

    Q.ninvoke(Company, 'create', company).then((result)=> {
      fulfilled(res, result);
    }).fail((error)=> {
      rejected(res, error);
    });
  }

  updateCompany = (req:any, res:express.Response, next:Function)=> {
    var criteria = {_id: req.params.id, parentCompany: req.user.affiliatedCompany};
    logger.debug("Update request received for criteria: ",criteria,{});
    var company:any;
    company = getCompany(req.body);
    company.updateBy = req.user._id;

    Q.ninvoke(Company, 'findOneAndUpdate', criteria, company).then((result)=> {
      fulfilled(res, result);
    }).fail((error)=> {
      rejected(res, error);
    }).done();
  }

  deactivateCompany = (req:any, res:express.Response, next:Function)=> {
    var criteria = {_id: req.params.id, parentCompany: req.user.affiliatedCompany};
    Q.ninvoke(Company, 'findOneAndUpdate', criteria, {status: 'inActive'}).then((result)=> {
      fulfilled(res, result);
    }).fail((error)=> {
      rejected(res, error);
    }).done();
  }


}
export = CompanyApi;

function fulfilled(res, result) {
  logger.debug("Request has been processed successfully\nResult: %j ", result, {});
  res.json({result:result});
}

function rejected(res, error) {
  logger.error("Error while processing Request : %j ", error, {});
  res.json({result:{}});
}

function getCompany(requestBody) {
  logger.debug("Request data: \n %j", requestBody, {});
  //Do I really need to do this ??
  return {
    accountManager: requestBody.accountManager,
    billCode: requestBody.billCode,
    name: requestBody.name,
    address: requestBody.address,
    reseller: requestBody.isReseller,
    domain: requestBody.domain,
    businessContact: requestBody.businessContact,
    technicalContact: requestBody.technicalContact,
    supportContact: requestBody.supportContact,
    supportedLanguages: requestBody.supportedLanguages,
    supportedDevices: requestBody.supportedDevices,
    updateAt: new Date()
  }
}
