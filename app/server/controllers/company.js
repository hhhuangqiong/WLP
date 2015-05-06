var _         = require('lodash');
var fs        = require('fs');
var Grid      = require('gridfs-stream');
var logger    = require('winston');
var moment    = require('moment-timezone');
var mongoose  = require('mongoose');
var Q         = require('q');

var Company   = require('../../collections/company');

var countries = require('../../data/countries.json');

export default class CompanyController {

  showCompanies(req, res) {
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

  getApplication(company) {
    var deferred = Q.defer();

    // TODO: turn into applcation request class and make real request
    setTimeout(function() {
      var serviceConfig = {serviceConfig: {
        "developerKey": "mdevac0645a7-a956-4e5d-833f-7983d7cc44dc",
        "developerSecret": "bacbd718-6f17-47ad-8a95-f8edd93ae030",
        "applicationIdentifier": "com.maaii-api.xxx",
        "applications": {
          ios: {
            "applicationKey": "mapp6a245b5c-6933-7951-7825-4e55646d487b",
            "applicationSecret": "64705066-4f5c-2777-7e6b-7b32792f2e25",
            "platform": "com.maaii.platform.ios"
          },
          android: {
            "applicationKey": "mapp6a245b5c-6933-7951-7825-4e55646d487c",
            "applicationSecret": "64705066-4f5c-2777-7e6b-7b32792f2e26",
            "platform": "com.maaii.platform.android"
          }
        }
      }};

      return deferred.resolve(_.merge(company, serviceConfig));
    }, 0);

    return deferred.promise;
  }

  getCompany(req, res, next) {
    let user = req.user;
    let carrierId = req.params.carrierId;
    let criteria = {
      carrierId: carrierId
    };

    Q.ninvoke(Company, 'findOne', criteria)
      .then((company)=>{
        res.status(200).json({
          company: company
        })
      })
      .catch((err)=>{
        res.status(500).json({
          err: err
        });
      })
      .done();
  }

  getCompanies(req, res, next) {
    var criteria = this.getCriteria(req.params);
    Q.ninvoke(Company, 'find', criteria)
      .then((companies)=>{
        var actions = [];
        for (let key in companies) {
          companies[key] = companies[key].toJSON();
          actions[key] = this.getApplication(companies[key]);
        }

        return Q.allSettled(actions).then(()=>{
          return companies;
        });
      })
      .then((companies)=>{
        this.fulfilled(res, companies);
      })
      .fail(function (error) {
        logger.error(error);
        this.rejected(res, error);
      })
      .done();
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

  saveCompany(req, res) {
    //req.checkBody('name').notEmpty();
    //req.checkBody('carrierId').notEmpty();
    var unlinkImage = _.bind(function(params, cb) {
      var oldImageId = this.oldImageId;
      if (mongoose.Types.ObjectId.isValid(oldImageId) && params.logo != oldImageId) {
        logger.debug('unlinking image with id %s in mongodb', oldImageId);

        var db = mongoose.connection.db;
        var mongoDriver = mongoose.mongo;
        var gfs = new Grid(db, mongoDriver);

        gfs.remove({ _id: oldImageId }, function(err) {
          if (err) return cb(err);
          return cb(null, params);
        })
      } else {
        return cb(null, params);
      }
    }, { oldImageId: req.body.logo})

    var uploadImage = _.bind(function(params, cb) {
      var file = this.file;
      if (file) {
        var db = mongoose.connection.db;
        var mongoDriver = mongoose.mongo;
        var gfs = new Grid(db, mongoDriver);

        var writeStream = gfs.createWriteStream({
          filename: file['originalFilename'],
          content_type: file['content-type']
        });

        fs.createReadStream(file.path).pipe(writeStream);

        writeStream.on('close', function(gfsFile) {
          //append image object id to params
          params.logo = gfsFile._id;
          logger.debug('new logo param:', params.logo);
          fs.unlink(file.path, function(err) {
            logger.debug('unlinking temp uploaded file at %s', file.path);
            if (err) return cb(err);
            return cb(null, params);
          });
        })
      } else {
        logger.debug('no logo uploaded');
        return cb(null, params);
      }
    }, { file: req.files.file });

    var validateCarrierId = function(params) {
      var deferred = Q.defer();
      setTimeout(function() {
        return deferred.resolve(params);
      }, 500);
      return deferred.promise;
    };

    var normalizeParams = _.bind(function(provisioningData) {
      var params = _.assign(this.data, provisioningData);
      params.createBy = params.updateBy = req.user._id;
      params.createAt = params.updateAt = new Date();
      //params.parentCompany = req.user.affiliatedCompany;
      return params;
    }, {data: req.body});

    var saveCompany = function(params) {
      if (params._id) {
        logger.debug('updating company with payload', params);
        return Q.ninvoke(Company, 'findOneAndUpdate', {_id: params._id}, params);
      } else {
        logger.debug('creating company with payload', params);
        return Q.ninvoke(Company, 'create', params);
      }
    };

    // TODO handle auto provisioning flow in later phrase
    validateCarrierId(req.body)
      .then(normalizeParams)
      .then((params)=> {
        return Q.nfcall(uploadImage, params);
      })
      .then((params)=> {
        return Q.nfcall(unlinkImage, params);
      })
      .then(saveCompany)
      .then((company)=>{
        res.status(200).json({
          company: company
        })
      })
      .catch((err)=>{
        logger.error(err);
        res.status(err.code || 500).json({
          error: err
        })
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

  //getCompany(requestBody) {
  //  logger.debug("Request data: \n %j", requestBody, {});
  //  //Do I really need to do this ??
  //  return {
  //    accountManager: requestBody.accountManager,
  //    billCode: requestBody.billCode,
  //    name: requestBody.name,
  //    address: requestBody.address,
  //    reseller: requestBody.isReseller,
  //    domain: requestBody.domain,
  //    businessContact: requestBody.businessContact,
  //    technicalContact: requestBody.technicalContact,
  //    supportContact: requestBody.supportContact,
  //    supportedLanguages: requestBody.supportedLanguages,
  //    supportedDevices: requestBody.supportedDevices,
  //    updateAt: new Date()
  //  };
  //};

  showHeader(req, res) {
    res.render('pages/companies/header-supplement');
  };

  showCompany(req, res, next) {
    var renderTemplate = function(options) {
      res.render('pages/companies/company', {
        parentCompanies: options.parentCompanies,
        countries: countries,
        timezones: moment.tz.names()
      });
    };

    var getParentCompanies = function(criteria) {
      var deferred = Q.defer();

      Company
        .find(criteria)
        .select('_id name')
        .exec((err, companies)=>{
          if (err) throw err;
          return deferred.resolve(companies);
        });

      return deferred.promise;
    }

    var criteria = {
      $or: [
        {'parentCompany': null},
        {'reseller': true}
      ]
    };

    Q.all([
        getParentCompanies(criteria)
      ])
      .spread((companies)=>{
        return {
          parentCompanies: companies
        };
      })
      .then(renderTemplate)
      .catch((err)=>{
        logger.error(err);
        next(err);
      })
  };
}
