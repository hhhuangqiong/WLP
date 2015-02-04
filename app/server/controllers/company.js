var _ = require('lodash');
var logger = require('winston');
var mongoose = require('mongoose');
var nconf = require('nconf');
var di = require('di');
var injector = new di.Injector([]);
// TODO
var Company = mongoose.model('company');
var ERRORPAGE = 'pages/errors/error';
var CompanyController = (function () {
    function CompanyController() {
        var _this = this;
        this.fetchInfo = function (req, res, next) {
            var criteria = _this.getCriteria(req.query);
            criteria.parentCompany = req.user.affiliatedCompany;
            var page = 'pages/companies/index';
            exec('find', criteria, null).then(function (result) {
                fulfilled(res, result, page);
            }).fail(function (error) {
                rejected(res, error, function () {
                    goto(res, [], page);
                });
            }).done();
        };
    }
    CompanyController.prototype.index = function (req, res, next) {
        res.render('pages/companies/new', { title: 'Add Company' });
    };
    CompanyController.prototype.addCompany = function (req, res, next) {
        //Fetching company data
        var user = req.user;
        var company;
        company = getCompany(req.body);
        company.updateBy = user._id;
        company.parentCompany = user.affiliatedCompany;
        company.createBy = user._id;
        company.createAt = new Date();
        //End
        exec('add', company, null).then(function (result) {
            fulfilled(res, { notification: "Company Added Successfully" }, 'pages/companies/new');
        }).fail(function (error) {
            rejected(res, error, null);
        }).done();
    };
    CompanyController.prototype.editForm = function (req, res, next) {
        var criteria = { _id: req.params.id, parentCompany: req.user.affiliatedCompany };
        exec('find', criteria, null).then(function (result) {
            //Can't find required id
            if (!result || result.length == 0) {
                throw new Error("Can't find entity with id " + req.params.id + " to edit.");
            }
            fulfilled(res, result[0], 'pages/companies/editcompany');
        }).fail(function (error) {
            rejected(res, error, null);
        }).done();
    };
    CompanyController.prototype.updateRecord = function (req, res, next) {
        //Get company data from request
        var company;
        company = getCompany(req.body);
        company.updateBy = req.user._id;
        var criteria = { _id: req.params.id, parentCompany: req.user.affiliatedCompany };
        exec('update', criteria, company).then(function (result) {
            return exec('find', criteria, null);
        }).then(function (result) {
            fulfilled(res, result, 'pages/companies/index');
        }).fail(function (error) {
            rejected(res, error, null);
        }).done();
    };
    CompanyController.prototype.deActivateRecord = function (req, res, next) {
        var criteria = { _id: req.params.id, parentCompany: req.user.affiliatedCompany };
        exec('update', criteria, { status: 'inactive' }).then(function (result) {
            return exec('find', criteria, null);
        }).then(function (result) {
            fulfilled(res, result, 'pages/companies/index');
        }).fail(function (error) {
            rejected(res, error, null);
        }).done();
    };
    /**
     *Only used in the fetchInfo Method to allow search by name, address,domain, and ID.
     * @param params
     * @returns {any}
     */
    //TODO: need to refactor it to a simpler method
    CompanyController.prototype.getCriteria = function (params) {
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
    return CompanyController;
})();
function fulfilled(res, result, page) {
    logger.debug("Request has been processed successfully\nResult: %j ", result, {});
    goto(res, result, page);
}
function rejected(res, error, next) {
    logger.error("Error while processing Request\n %j ", error, {});
    if (next) {
        next();
    }
    else {
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
        businessContact: { name: requestBody.bc_name, phone: requestBody.bc_phone, email: requestBody.bc_email },
        technicalContact: { name: requestBody.tc_name, phone: requestBody.tc_phone, email: requestBody.tc_email },
        supportContact: { name: requestBody.sc_name, phone: requestBody.sc_phone, email: requestBody.sc_email },
        supportedLanguages: requestBody.languages,
        supportedDevices: requestBody.devices,
        updateAt: new Date()
    };
}
/**
 * render the requested page
 * @param page
 * @param data
 * @param res
 */
function goto(res, data, page) {
    if (page != ERRORPAGE) {
        var result = {};
        if (data) {
            result = { result: data };
        }
        logger.debug("Serving " + page + " with the following data\n %j", result, {});
        res.render(page, result);
    }
    else {
        res.render(ERRORPAGE, { message: "Error while processing request", error: data });
    }
}
/**
 * Executing query operation.
 * @param op operation {find,update,add,delete...}
 * @param criteria
 * @param opt optional parameter, used in update to provide the updated entity to be persisted.
 * @returns {any}
 */
function exec(op, criteria, opt) {
    logger.debug("Executing " + op + " request \nCriteria: ", criteria, "\nOptions:", opt);
    // TOFIX probably break
    return Company[op](criteria, opt);
}
module.exports = Company;
