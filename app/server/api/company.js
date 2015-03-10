var logger = require('winston');
var Q = require('q');
var di = require('di');
var Company = require('app/collections/company');
//var companyRepo = new Company();
var CompanyApi = (function () {
    function CompanyApi() {
        var _this = this;
        this.getCompanies = function (req, res, next) {
            var criteria = _this.getCriteria(req.params);
            Q.ninvoke(Company, 'find', criteria).then(function (companies) {
                fulfilled(res, companies);
            }).fail(function (error) {
                rejected(res, error);
            }).done();
        };
        this.newCompany = function (req, res, next) {
            //Fetching companies data
            var user = req.user;
            var company;
            company = getCompany(req.body);
            company.updateBy = user._id;
            company.parentCompany = user.affiliatedCompany;
            company.createBy = user._id;
            company.createdAt = new Date();
            //End
            logger.debug("Initiate persisting request for :%j", company, {});
            Q.ninvoke(Company, 'create', company).then(function (result) {
                fulfilled(res, result);
            }).fail(function (error) {
                rejected(res, error);
            });
        };
        this.updateCompany = function (req, res, next) {
            var criteria = { _id: req.params.id, parentCompany: req.user.affiliatedCompany };
            logger.debug("Update request received for criteria: ", criteria, {});
            var company;
            company = getCompany(req.body);
            company.updateBy = req.user._id;
            Q.ninvoke(Company, 'findOneAndUpdate', criteria, company).then(function (result) {
                fulfilled(res, result);
            }).fail(function (error) {
                rejected(res, error);
            }).done();
        };
        this.deactivateCompany = function (req, res, next) {
            var criteria = { _id: req.params.id, parentCompany: req.user.affiliatedCompany };
            Q.ninvoke(Company, 'findOneAndUpdate', criteria, { status: 'inActive' }).then(function (result) {
                fulfilled(res, result);
            }).fail(function (error) {
                rejected(res, error);
            }).done();
        };
    }
    CompanyApi.prototype.getCriteria = function (params) {
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
    return CompanyApi;
})();
function fulfilled(res, result) {
    logger.debug("Request has been processed successfully\nResult: %j ", result, {});
    res.json({ result: result });
}
function rejected(res, error) {
    logger.error("Error while processing Request : %j ", error, {});
    res.json({ result: {} });
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
    };
}
module.exports = CompanyApi;
