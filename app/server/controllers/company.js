var _         = require('lodash');
var fs        = require('fs');
var Grid      = require('gridfs-stream');
var logger    = require('winston');
var mongoose  = require('mongoose');
var Q         = require('q');
var nconf     = require('nconf');

import {ApplicationRequest} from '../../lib/requests/Application';

var Company   = require('../../collections/company');
var PortalUser = require('../../collections/portalUser');

var featureList = require('../../data/featureList.json');

export default class CompanyController {
  /**
   * Deactivate an company with carrierId
   *
   * @param req
   * @param res
   */
  deactivateCompany(req, res) {
    var criteria = { _id: req.params.id, parentCompany: req.user.affiliatedCompany };
    Q.ninvoke(Company, 'findOneAndUpdate', criteria, { status: 'inActive' }).then((result)=>{
      this.fulfilled(res, result);
    }).fail(function (error) {
      this.rejected(res, error);
    }).done();
  }

  /**
   * Controller Middleware
   * get all user managing Companies resource in JSON format
   *
   * @param req
   * @param res
   */
  getCompanies(req, res) {
    var criteria = this.getCriteria(req.params);

    /**
     * get applications and services by carrierId
     *
     * @param carrierId {String}
     * @returns {Promise.<T>|*}
     */
    var getApplications = function(carrierId) {
      let request = new ApplicationRequest({ baseUrl: nconf.get('mumsApi:baseUrl') });

      return Q.allSettled([
          Q.ninvoke(request, 'getApplications', carrierId),
          Q.ninvoke(request, 'getApiService', carrierId)
        ])
        .spread((applications, services)=>{
          let result = {
            carrierId: carrierId,
            applicationId: null,
            developerKey: null,
            developerSecret: null,
            applications: {
              ios: {},
              android: {}
            }
          };

          if (services.value) {
            _.filter(services.value, function(service) {
              if (service.type == 'API') {
                _.merge(result, {
                  developerKey: service['key'],
                  developerSecret: service['secret']
                });
              }
            });
          }

          if (applications.value) {
            result.applicationId = applications.value.applicationId;

            _.filter(applications.value.applications, function(application) {
              if (application.platform.match(/.ios$/)) {
                result.applications.ios = application;
              } else if (application.platform.match(/.android$/)) {
                result.applications.android = application;
              }
            });
          }

          return result;
        })
        .catch((error)=>{
          logger.error(error);
          return null;
        })
    };

    Q.ninvoke(Company, 'find', criteria)
      .then((companies)=>{
        let actions = [];

        let _companies = _(companies).reduce(function(prev, current) {
          prev[current.carrierId] = current.toObject();
          return prev;
        }, {});

        // Changed, we do lazy load now

        //_.forEach(_companies, function(company, key) {
        //  actions.push(getApplications(_companies[key].carrierId));
        //});

        return Q.allSettled(actions).then((results)=>{

          //results.forEach(function (result) {
          //  if (result.state === "fulfilled") {
          //    _.merge(_companies[result.value.carrierId], {
          //      serviceConfig: {
          //        applicationId: result.value.applicationId,
          //        developerKey: result.value.developerKey,
          //        developerSecret: result.value.developerSecret,
          //        applications: result.value.applications
          //      }
          //    });
          //  }
          //});

          return _companies;
        })
        .then((companies)=>{
          return res.status(200).json({
            companies: companies
          })
        })
        .catch((error)=>{
          throw error;
        });
      })
      .catch((err)=>{
        logger.error(err);
        return res.status(err.status).json({
          error: err
        });
      })
  };

  // By Kareem and is not reviewed yet
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

  // By Kareem and is not reviewed yet
  fulfilled(res, result) {
    res.json({ result: result });
  };

  // By Kareem and is not reviewed yet
  rejected(res, error) {
    logger.error("Error while processing Request : %j ", error, {});
    res.json({ result: {} });
  };

  /**
   * Check if the to-be-updated Company is assigned to the current PortalUser
   * if so, the user is with permission to update
   *
   * @param user {Object} User Object from Passport
   * @param companyId {String} Mongoose Document _id of to-be-updated Company
   * @returns {Object} Mongoose Document or null
   */
  checkPermission(user, companyId, cb) {
    logger.debug('Checking permission of user(%s) with company(%s)', user.username, companyId);

    if (!user || !companyId) {
      logger.debug('User or Company not found.');
      return cb(new Error('User or Company not found'));
    }

    if (user.isRoot) {
      logger.debug('Is Root User. bypassing permission checking.');
      return cb(null, user);
    }

    return Q.ninvoke(PortalUser, 'findOne', {
      _id: user._id,
      assignedCompanies: {
        $in: [companyId]
      }
    })
  };

  saveProfile(req, res) {
    //req.checkBody('name').notEmpty();
    //req.checkBody('carrierId').notEmpty();

    /**
     * Check if the carrierId is valid via Provisioning Api
     *
     * @param params {Object} payload object
     * @returns {*|promise} return provisioning data
     */
    var validateCarrierId = function(params) {
      var deferred = Q.defer();
      setTimeout(function() {
        return deferred.resolve(params);
      }, 500);
      return deferred.promise;
    };

    /**
     * Normalize payload object
     *
     * @param provisioningData {Object} provisioning data received via Api
     * @returns {*|promise} return a normalized payload object
     */
    var normalizeParams = _.bind(function(provisioningData) {
      var params = _.assign(this.data, provisioningData);
      params.businessContact = {
        name: this.data['bc-name'],
        email: this.data['bc-email'],
        phone: this.data['bc-phone']
      };
      params.technicalContact = {
        name: this.data['tc-name'],
        email: this.data['tc-email'],
        phone: this.data['tc-phone']
      };
      params.supportContact = {
        name: this.data['sc-name'],
        email: this.data['sc-email'],
        phone: this.data['sc-phone']
      };
      params.createBy = params.updateBy = req.user._id;
      params.createAt = params.updateAt = new Date();
      // should pick what is needed rather than omitting
      _.omit(params, 'bc-name', 'bc-email', 'bc-phone', 'bc-name', 'tc-email', 'tc-phone', 'tc-name', 'sc-email', 'sc-phone');
      //params.parentCompany = req.user.affiliatedCompany;
      return params;
    }, {data: req.body});

    /**
     * Upload an image to MongoDB gridFs if an attachment exists
     *
     * @param params {Object} normalized payload Object
     * @param cb {Function}
     */
    var uploadImage = _.bind(function(params, cb) {
      var file = this.file;
      if (file && (file.originalFilename != '' && file.size > 0)) {
        logger.debug('file upload is detected, starting gridfs writing stream');

        let db = mongoose.connection.db;
        let mongoDriver = mongoose.mongo;
        let gfs = new Grid(db, mongoDriver);

        let writeStream = gfs.createWriteStream({
          filename: file.originalFilename,
          content_type: file.headers['content-type']
        });

        // writing file into mongodb
        fs.createReadStream(file.path).pipe(writeStream);

        // on writing finish, remove the temp image
        writeStream.on('close', function(gfsFile) {
          //append image object id to params
          params.logo = gfsFile._id;
          fs.unlink(file.path, function(err) {
            logger.debug('unlinking newly temp uploaded file at %s', file.path);
            if (err) return cb(err);
            return cb(null, params);
          });
        })
      } else {
        logger.debug('no logo uploaded');
        return cb(null, params);
      }
    }, { file: req.files.logo });

    /**
     * Remove the old image document in MongoDB
     *
     * @param params {Object} normalized payload Object
     * @param cb {Function}
     */
    var unlinkImage = _.bind(function(params, cb) {
      let oldImageId = this.oldImageId;
      if (mongoose.Types.ObjectId.isValid(oldImageId) && params.logo != oldImageId) {
        logger.debug('unlinking image with id %s in mongodb', oldImageId);

        let db = mongoose.connection.db;
        let mongoDriver = mongoose.mongo;
        let gfs = new Grid(db, mongoDriver);

        gfs.remove({ _id: oldImageId }, function(err) {
          if (err) return cb(err);
          return cb(null, params);
        });
      } else {
        return cb(null, params);
      }
    }, { oldImageId: req.body.logo});

    /**
     * Update Company MongoDB Document
     * create if _id is null
     * update if _id exists
     *
     * @param params {Object} normalized payload
     */
    var saveCompany = function(params) {
      if (params._id) {
        logger.debug('updating company with payload %j', params, {});
        return Q.ninvoke(Company, 'findOneAndUpdate', {_id: params._id}, params, {'new': true});
      } else {
        logger.debug('creating company with payload %j', params, {});
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

  saveService(req, res) {
    /**
     * Get service type of Company in String as determinant of features
     *
     * @param _id {String || Mongoose.Schema.Types.ObjectId} id of to-be-updated Company
     * @returns {String} Company service type ('WL'||'SDK')
     */
    var getCompanyServiceType = _.bind(function() {
      return Q.ninvoke(Company, 'findOne', {_id: this._id})
        .then((company)=>{
          if (!company) throw new Error('company does not exist');
          return company.getServiceType().toLowerCase();
        })
        .catch((err)=> {
          throw new Error(err);
        });
    }, {_id: req.body._id});

    /**
     * Construct the payload for updating Company Model
     *
     * @param serviceType {String} ('WL'||'SDK')
     * @parma params {Object} original payload received
     *
     * return {Object} payload Object
     */
    var normalizeParams = _.bind(function(serviceType) {
      let params = this.params;
      let features = {};

      _.forEach(featureList[serviceType], function(feature, key) {
        if (_.first(Object.keys(feature)).toLowerCase() != 'label') {
          _.forEach(feature, function(subFeature, subKey) {
            _.merge(features, {[subKey]: params[subKey] == 'on' ? true : false});
          });
        } else {
          _.merge(features, {[key]: params[key] == 'on' ? true : false});
        }
      });

      let payload = {
        serviceConfig: {
          applications: {
            ios: {
              name: params['ios-application-name']
            },
            android: {
              name: params['android-application-name']
            }
          }
        },
        features: features,
        updateAt: params.updateAt,
        updateBy: params.updateBy
      };

      return payload;
    }, {params: req.body});

    var saveCompany = _.bind(function(payload) {
      logger.debug('updating company service with payload %j', payload, {});
      return Q.ninvoke(Company, 'findOneAndUpdate', {_id: this._id}, {$set: payload}, {'new': true});
    }, {_id: req.body._id});

    Q.ninvoke(this, 'checkPermission', req.user, req.body._id)
      .then((user)=>{
        // user found then is permitted
        if (!user) {
          throw new Error('permission denied');
        }
      })
      .then(getCompanyServiceType)
      .then(normalizeParams)
      .then(saveCompany)
      .then((company)=>{
        res.status(200).json({
          company: company
        });
      })
      .catch((err)=>{
        logger.error(err);
        res.status(err.code || 500).json({
          error: err
        });
      })
  };

  saveWidget(req, res) {
    //req.checkBody('carrierId').notEmpty();
    /**
     * Update Company widgets
     *
     * @param isPermitted {Boolean}
     * @param params {Object} data params received
     */
    var saveCompany = _.bind(function() {
      let params = this.params;

      logger.debug('updating company widget with payload %j', params, {});

      params.updateBy = req.user._id;
      params.updateAt = new Date();

      // forgive me making this verbose at this moment
      return Q.ninvoke(Company, 'findOneAndUpdate', {_id: params._id}, {
        $set: {
          widgets: {
            overview: [
              params['overview-widget-1'],
              params['overview-widget-2'],
              params['overview-widget-3'],
              params['overview-widget-4'],
              params['overview-widget-5'],
              params['overview-widget-6']
            ],
            stores: [
              params['stores-widget-1'],
              params['stores-widget-2'],
              params['stores-widget-3'],
              params['stores-widget-4'],
              params['stores-widget-5'],
              params['stores-widget-6']
            ],
            calls: [
              params['calls-widget-1'],
              params['calls-widget-2'],
              params['calls-widget-3'],
              params['calls-widget-4'],
              params['calls-widget-5'],
              params['calls-widget-6']
            ],
            im: [
              params['im-widget-1'],
              params['im-widget-2'],
              params['im-widget-3'],
              params['im-widget-4'],
              params['im-widget-5'],
              params['im-widget-6']
            ],
            sms: [
              params['sms-widget-1'],
              params['sms-widget-2'],
              params['sms-widget-3'],
              params['sms-widget-4'],
              params['sms-widget-5'],
              params['sms-widget-6']
            ]
          },
          updateAt: params.updateAt,
          updateBy: params.updateBy
        }
      }, {'new': true});
    }, {params: req.body});

    Q.ninvoke(this, 'checkPermission', req.user, req.body._id)
      .then((user)=>{
        // user found then is permitted
        if (!user) {
          throw new Error('permission denied');
        }
      })
      .then(saveCompany)
      .then((company)=>{
        res.status(200).json({
          company: company
        });
      })
      .catch((err)=>{
        logger.error(err);
        res.status(err.code || 500).json({
          error: err
        });
      })
  };

  /**
   * Acquire the application service configs with carrierId
   *
   * @param company {Object} normalized payload
   * @returns {*|promise} return a payload merged with application configs
   */
  getApplications(req, res) {
    req.checkParams('carrierId').notEmpty();
    req.checkQuery('userId').notEmpty();

    if (req.validationErrors()) {
      return res.status(400);
    };

    let userId = req.query.userId;
    let carrierId = req.params.carrierId;

    var makeApiRequest = _.bind(function() {
      let request = new ApplicationRequest({ baseUrl: nconf.get('mumsApi:baseUrl'), timeout: nconf.get('mumsApi:timeout') });
      let carrierId = this.carrierId;

      return Q.allSettled([
          Q.ninvoke(request, 'getApplications', carrierId),
          Q.ninvoke(request, 'getApiService', carrierId)
        ])
        .spread((applications, services)=>{
          let result = {
            applicationId: null,
            developerKey: null,
            developerSecret: null,
            applications: {
              ios: {},
              android: {}
            }
          };

          if (services.value) {
            _.filter(services.value, function(service) {
              if (service.type == 'API') {
                _.merge(result, {
                  developerKey: service['key'],
                  developerSecret: service['secret']
                });
              }
            });
          }

          if (applications.value) {
            result.applicationId = applications.value.applicationId;

            _.filter(applications.value.applications, function(application) {
              if (application.platform.match(/.ios$/)) {
                result.applications.ios = application;
              } else if (application.platform.match(/.android$/)) {
                result.applications.android = application;
              }
            });
          }

          return result;
        })
        .catch((error)=>{
          logger.error(error);
          return null;
        })
    }, { carrierId: carrierId });

    var hasPermission = function(user, cb) {
      logger.debug('checking permission for user %j', user, {});

      // Root and M800 Admin has same permission here
      if (user.isRoot) {
        return cb(null, true);
      }

      // besides Root and M800 Admin, M800 Dev is the only role
      // who has permission to edit, and hence, to fetch the Company applications
      var isM800AdminOrDev = function() {
        Q.ninvoke(PortalUser, 'findOne', {
          _id: user._id,
          affiliatedCompany: 'M800',
          assignedGroup: {
            $or: ['admin', 'dev']
          }
        }).then((company)=>{
          return cb(null, !!company);
        }).catch((error)=>{
          throw error;
        });
      };

      isM800AdminOrDev();
    };

    Q.ninvoke(PortalUser, 'findOne', { _id: userId })
      .then((user)=>{
        if (!user) {
          res.status(401);
        };

        return Q.nfcall(hasPermission, user);
      })
      .then((isPermitted)=>{
        if (!isPermitted) {
          res.status(401);
        }
      })
      .then(makeApiRequest)
      .then((result)=>{
        res.status(200).json({
          services: result
        });
      })
      .catch((err)=>{
        logger.error(err);
        res.status(500).json({
          error: err
        });
      });
  };
}
