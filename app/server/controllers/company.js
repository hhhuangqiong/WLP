var logger  = require('winston');
var Q       = require('q');

var Company = require('app/collections/company');

export default class CompanyController {

  index(req, res, next) {
    res.render('pages/companies/index');
  };

  deactivateCompany(req, res, next) {
    var criteria = { _id: req.params.id, parentCompany: req.user.affiliatedCompany };
    Q.ninvoke(Company, 'findOneAndUpdate', criteria, { status: 'inActive' }).then((result)=>{
      this.fulfilled(res, result);
    }).fail(function (error) {
      this.rejected(res, error);
    }).done();
  };

  getCompanies(req, res, next) {
    var criteria = this.getCriteria(req.params);
    Q.ninvoke(Company, 'find', criteria).then((companies)=>{
      this.fulfilled(res, companies);
    }).fail(function (error) {
      this.rejected(res, error);
    }).done();
  };

  getCriteria(params) {
    var criteria = {};
    for (var key in params) {
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
  };

  newCompany(req, res, next) {
    //Fetching companies data
    var user = req.user;
    var company;
    company = this.getCompany(req.body);
    company.updateBy = user._id;
    company.parentCompany = user.affiliatedCompany;
    company.createBy = user._id;
    company.createAt = new Date();
    //End
    logger.debug("Initiate persisting request for :%j", company, {});
    Q.ninvoke(Company, 'create', company).then((result)=>{
      this.fulfilled(res, result);
    }).fail(function (error) {
      this.rejected(res, error);
    });
  };

  updateCompany(req, res, next) {
    var criteria = { _id: req.params.id, parentCompany: req.user.affiliatedCompany };
    logger.debug("Update request received for criteria: ", criteria, {});
    var company;
    company = this.getCompany(req.body);
    company.updateBy = req.user._id;
    Q.ninvoke(Company, 'findOneAndUpdate', criteria, company).then((result)=>{
      this.fulfilled(res, result);
    }).fail(function (error) {
      this.rejected(res, error);
    }).done();
  };

  fulfilled(res, result) {
    logger.debug("Request has been processed successfully\nResult: %j ", result, {});
    res.json({ result: result });
  };

  rejected(res, error) {
    logger.error("Error while processing Request : %j ", error, {});
    res.json({ result: {} });
  };

  getCompany(requestBody) {
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
    };
  };

  companyHeader(req, res, next) {
    res.render('pages/companies/header');
  };

  new(req, res, next) {
    res.render('pages/companies/form');
  };

  edit(req, res, next) {
    res.render('pages/companies/edit');
  };
}
