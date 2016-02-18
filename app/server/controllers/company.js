import _ from 'lodash';
import fs from 'fs';
import Grid from 'gridfs-stream';
import logger from 'winston';
import mongoose from 'mongoose';
import Q from 'q';
import nconf from 'nconf';

import config from '../../config';

import {ApplicationRequest} from '../../lib/requests/Application';

let Company   = require('../../collections/company');
let PortalUser = require('../../collections/portalUser');

export default class CompanyController {
  /**
   * @method isRootUser
   * to check if a given user is Root User
   *
   * @param username {String} username of PortalUser
   * @param cb {Function} callback
   */
  isRootUser(username, cb) {
    return Q.ninvoke(PortalUser, 'findOne', { username })
      .then((user) => {
        if (!user) {
          return cb(new Error('insufficient privilege'));
        }

        return cb(null, user.isRoot);
      })
      .catch((err) => {
        logger.error(err);
        return cb(err);
      });
  }

  /**
   * @method isUserManagingCompany
   * to check if a given user is managing the company
   *
   * @param username {String} username of PortalUser
   * @param carrierId {String} carrier id
   * @param cb {Function} callback
   */
  isUserManagingCompany(username, carrierId, cb) {
    return Q.ninvoke(Company, 'findOne', { carrierId })
      .then((company) => {
        if (!company)
          throw new Error('company not found');

        return Q.ninvoke(PortalUser, 'findOne', { username, assignedCompanies: mongoose.Types.ObjectId(company._id) })
          .then((user) => {
            return cb(null, !!user);
          })
          .catch((err) => {
            logger.error(err);
          });
      })
      .catch((err) => {
        logger.error(err);
      });
  }

  /**
   * @method isAllowForCarrier
   * this is just a baseline checking, not comprehensive enough
   *
   * check if a given user is allowed to access the carrier
   * if the user is Root User, then allowed
   * if the user is managing the carrier, then allowed
   * otherwise, not allowed
   *
   * @param username {String} username of PortalUser
   * @param carrierId {String} carrier id
   * @param cb {Function} callback
   */
  isAllowForCarrier(username, carrierId, cb) {
    return Q.ninvoke(this, 'isRootUser', username)
      .then((isRoot) => {
        if (isRoot)
          return cb(null, true);

        return Q.ninvoke(this, 'isUserManagingCompany', username, carrierId)
          .then((permitted) => {
            return cb(null, permitted);
          })
          .catch((err) => {
            return cb(err);
          })
          .done();
      })
      .catch((err) => {
        logger.error(err);
        return cb(err);
      });
  }

  /**
   * @method getCompanyByCarrierId
   * @param carrierId {String} carrier id
   * @param cb {Function} callback
   */
  getCompanyByCarrierId(carrierId, cb) {
    if (!cb || typeof cb !== 'function')
      throw new Error('callback is not a function');

    return Q.ninvoke(Company, 'findOne', { carrierId })
      .then((company) => {
        if (!company) {
          throw new Error('company not found');
        }

        cb(null, company);
      })
      .catch((err) => {
        cb(err);
      });
  }

  /**
   * @method deactivateCompany
   * Deactivate an company with a given carrierId
   *
   * @param req
   * @param res
   */
  deactivateCompany(req, res) {
    let { username, affiliatedCompany } = req.user;
    let { carrierId } = req.params;

    let deactivateCompany = function(company) {
      return Q.ninvoke(company, 'deactivate')
        .then((result) => {
          if (!result)
            return res.status(500);

          return res.status(200).json(result);
        })
        .catch((error) => {
          logger.error(error);
          return res.status(500);
        });
    };

    Q.ninvoke(this, 'isAllowForCarrier', username, carrierId)
      .then((permitted) => {
        if (!permitted)
          throw new Error('unauthorized');
      })
      .then(() => {
        return Q.ninvoke(this, 'getCompanyByCarrierId', carrierId);
      })
      .then((company) => {
        if (!company)
          throw new Error('company not found');

        return company;
      })
      .then(deactivateCompany)
      .catch((err) => {
        return res.status(500).json({
          error: err
        });
      })
      .done();
  }

  /**
   * @method reactivateCompany
   *
   * @param req
   * @param res
   */
  reactivateCompany(req, res) {
    let { username, affiliatedCompany } = req.user;
    let { carrierId } = req.params;

    let reactivateCompany = function(company) {
      return Q.ninvoke(company, 'activate')
        .then((result) => {
          if (!result)
            return res.status(500);

          return res.status(200).json(result);
        })
        .catch((error) => {
          logger.error(error);
          return res.status(500);
        });
    };

    Q.ninvoke(this, 'isAllowForCarrier', username, carrierId)
      .then((permitted) => {
        if (!permitted)
          throw new Error('unauthorized');
      })
      .then(() => {
        return Q.ninvoke(this, 'getCompanyByCarrierId', carrierId);
      })
      .then((company) => {
        if (!company)
          throw new Error('company not found');

        return company;
      })
      .then(reactivateCompany)
      .catch((err) => {
        logger.error(err);
        return res.status(500).json({
          error: err
        });
      })
      .done();
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

    Q.ninvoke(Company, 'find', criteria)
      .then((companies)=> {

        let _companies = _(companies).reduce(function(prev, current) {
          prev[current.carrierId] = current.toObject();
          return prev;
        }, {});

        return _companies;
      })
      .then((companies) => {
        return res.status(200).json({
          companies: companies
        });
      })
      .catch((err) => {
        logger.error(err);
        return res.status(err.status).json({
          error: err
        });
      })
      .done();
  }

  /**
   * @method getParentCompanies
   * get parent companies
   * allowed only for M800 user
   */
  getParentCompanies(req, res) {
    var hasPermission = function(user, cb) {
      logger.debug('checking permission for user %j', user, {});

      // Check if is Root
      if (user.isRoot) {
        return cb(null, true);
      }

      // Check if is M800 user
      return Q.ninvoke(Company, 'findOne', {
        _id: user.affiliatedCompany,
        name: 'm800'
      }).then((company)=> {
        return cb(null, !!company);
      }).catch((err) => {
        return cb(err);
      });
    };

    Q.nfcall(hasPermission, req.user)
      .then((allowed) => {
        if (!allowed)
          throw new Error('permission denied');

        return Q.ninvoke(Company, 'find', {
          $or: [
            { parentCompany: null },
            { reseller: true }
          ]
        }, '_id name').then((companies) => {
          return res.status(200).json({
            companies: companies
          });
        });
      })
      .catch((err) => {
        logger.error(err);
        return res.status(err.status || 500).json({
          error: {
            message: err.message
          }
        });
      })
      .done();
  }

  // By Kareem and is not reviewed yet
  getCriteria(params) {
    var criteria = {};
    for (var key in params) {
      switch (key) {
      case 'id':
      case 'domain':
      case 'name':
      case 'address':
        if (!_.isNull(params[key]) && !_.isUndefined(params[key])) {
            criteria[key] = params[key];
          }

      default:
        logger.warn('Invalid search criteria requested: ' + key);
      }
    }

    logger.debug('Requested search criteria: %j', criteria, {});
    return criteria;
  }

  /**
   * Check if the given company is assigned to the current PortalUser
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
      .catch((err) => {
        logger.error(err);
        cb(err);
        return;
      });
  }

  saveProfile(req, res) {
    //req.checkBody('name').notEmpty();
    //req.checkBody('carrierId').notEmpty();

    /**
     * @method validateCarrierId
     * Check if the carrierId is valid via Provisioning Api
     *
     * @param params {Object} payload object
     * @returns {*|promise} return provisioning data
     */
    var validateCarrierId = function(params) {
      let request = new ApplicationRequest({ baseUrl: nconf.get('mumsApi:baseUrl'), timeout: nconf.get('mumsApi:timeout') });
      return Q.ninvoke(request, 'validateCarrier', params.carrierId)
        .then((isValid) => {
          if (!isValid)
            throw new Error('invalid carrier id');

          return params;
        });
    };

    /**
     * Normalize payload object
     *
     * @param provisioningData {Object} provisioning data received via Api
     * @returns {*|promise} return a normalized payload object
     */
    var normalizeParams = _.bind(function(provisioningData) {
      var params = _.assign({
        name: this.data.companyName,
        carrierId: this.data.carrierId,
        reseller: this.data.reseller,
        address: this.data.address,
        categoryID: this.data.categoryId,
        country: this.data.country,
        timezone: this.data.timezone,
        accountManager: this.data.accountManager,
        billCode: this.data.billCode,
        expectedServiceDate: this.data.expectedServiceData,
        businessContact: {
          name: this.data.bcName,
          email: this.data.bcEmail,
          phone: this.data.bcPhone
        },
        technicalContact: {
          name: this.data.tcName,
          email: this.data.tcEmail,
          phone: this.data.tcPhone
        },
        supportContact: {
          name: this.data.scName,
          email: this.data.scEmail,
          phone: this.data.scPhone
        },
        createBy: req.user._id,
        createAt: new Date(),
        updateBy: req.user._id,
        updateAt: new Date()
      }, provisioningData);

      // if logo is not uploaded, this.data.logo will not exist
      // do not overwrite logo if logo is not uploaded
      _.merge(params, { logo: this.data.logo });

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
      if (file && (file.originalFilename !== '' && file.size > 0)) {
        logger.debug('file upload is detected, starting gridfs writing stream');

        let db = mongoose.connection.db;
        let mongoDriver = mongoose.mongo;
        let gfs = new Grid(db, mongoDriver);

        let writeStream = gfs.createWriteStream({
          filename: file.originalFilename,

          // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
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
        });
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
      if (mongoose.Types.ObjectId.isValid(oldImageId) && params.logo !== oldImageId) {
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
        return Q.ninvoke(Company, 'findOneAndUpdate', {_id: params._id}, params, {new: true});
      } else {
        logger.debug('creating company with payload %j', params, {});
        return Q.ninvoke(Company, 'create', params);
      }
    };

    // TODO handle auto provisioning flow in later phrase
    validateCarrierId(req.body)
      .then(normalizeParams)
      .then((params) => {
        return Q.nfcall(uploadImage, params);
      })
      .then((params) => {
        return Q.nfcall(unlinkImage, params);
      })
      .then(saveCompany)
      .then((company) => {
        res.status(200).json({
          company: company,
          carrierId: req.params.carrierId
        });
      })
      .catch((err) => {
        logger.error(err);
        res.status(err.code || 500).json({
          error: err
        });
      })
      .done();
  }

  saveService(req, res) {
    /**
     * Get service type of Company in String as determinant of features
     *
     * @param _id {String || Mongoose.Schema.Types.ObjectId} id of to-be-updated Company
     * @returns {String} Company service type ('WL'||'SDK')
     */
    var getCompanyServiceType = _.bind(function() {
      return Q.ninvoke(Company, 'findOne', { _id: this._id })
        .then((company)=> {
          if (!company) throw new Error('company does not exist');
          return company.getServiceType().toLowerCase();
        })
        .catch((err)=> {
          throw new Error(err);
        });
    }, { _id: req.body._id });

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

      let payload = {
        serviceConfig: {
          applications: {
            ios: {
              name: params.iOSApplicationName
            },
            android: {
              name: params.androidApplicationName
            }
          }
        },
        updateAt: params.updateAt,
        updateBy: params.updateBy
      };

      return payload;
    }, { params: req.body });

    var saveCompany = _.bind(function(payload) {
      logger.debug('updating company service with payload %j', payload, {});
      return Q.ninvoke(Company, 'findOneAndUpdate', { _id: this._id }, { $set: payload }, { new: true });
    }, { _id: req.body._id });

    Q.ninvoke(this, 'checkPermission', req.user, req.body._id)
      .then((user)=> {
        // user found then is permitted
        if (!user) {
          throw new Error('permission denied');
        }
      })
      .then(getCompanyServiceType)
      .then(normalizeParams)
      .then(saveCompany)
      .then((company)=> {
        return res.status(200).json({
          company: company,
          carrierId: req.params.carrierId
        });
      })
      .catch((err)=> {
        logger.error(err);
        res.status(err.code || 500).json({
          error: err
        });
      })
      .done();
  }

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

      let { WIDGETS: sections } = config;
      let widgetPayload = {};

      _.map(sections, ({ NUMBER_OF_WIDGETS: numberOfWidgets }, key) => {
        let section = key.toLowerCase();
        widgetPayload[section] = [];
        for (let i = 0; i < numberOfWidgets; i++) {
          widgetPayload[section].push(params[`${section}-widget-${i}`]);
        }
      });

      return Q.ninvoke(Company, 'findOneAndUpdate', {_id: params._id}, {
        $set: {
          widgets: widgetPayload,
          updateAt: new Date(),
          updateBy: req.user._id
        }
      }, {new: true});
    }, {params: req.body});

    Q.ninvoke(this, 'checkPermission', req.user, req.body._id)
      .then((user)=> {
        // user found then is permitted
        if (!user) {
          throw new Error('permission denied');
        }
      })
      .then(saveCompany)
      .then((company)=> {
        res.status(200).json({
          company: company
        });
      })
      .catch((err)=> {
        logger.error(err);
        res.status(err.code || 500).json({
          error: err
        });
      })
      .done();
  }

  /**
   * Checks if the user having the specified userId can access the application information.
   *
   * This function essentially returns true if the user is having company M800
   * and is under the group `admin`, `root`, or `dev`.
   *
   * @method
   * @param {String} userId  The user ID
   * @returns {Promise.<boolean>} True if the user can access, false otherwise
   * @throws {Promise.<Error>} If anything goes wrong
   */
  canAccessApplicationInformation(userId) {
    let hasPermission = function(companyId) {
      // besides Root and M800 Admin, M800 Dev is the only role
      // who has permission to edit, and hence, to fetch the Company applications
      let isM800AdminOrDev = function() {
        return Q.ninvoke(PortalUser, 'find', {
          _id: userId,
          affiliatedCompany: companyId,
          assignedGroup: {
            $in: ['admin', 'root', 'dev']
          }
        }).then((user) => {
          return !!user;
        });
      };

      return isM800AdminOrDev();
    };

    return Q.ninvoke(Company, 'getRootCompanyId')
      .then(hasPermission);
  }

  /**
   * Creates an error object which can be used as a response to the client.
   * This function is basically a copy of lib/requests/Base#handleError.
   *
   * @method
   * @param {Object} err  The error object from superagent
   * @returns {Error} The error object for response
   */
  createResponseError(err) {
    let error = new Error(err.message);

    if (err.timeout) {
      error.status = 504;
      error.timeout = err.timeout;
      return error;
    }

    error.status = err.status || 500;
    error.code = err.code;
    return error;
  }

  /**
   * Acquire the application ID's with carrierId.
   * The `carrierId` must be embedded in the request object's params.
   * The `userId` must be embedded in the request object's query.
   *
   * @method
   * @param {Request} req  The node request object
   * @param {Response} res  The node response object
   */
  getApplicationIds(req, res) {
    req.checkParams('carrierId').notEmpty();
    req.checkQuery('userId').notEmpty();

    if (req.validationErrors()) {
      return res.status(400).json({
        error: new Error('missing query parameter `userId`')
      });
    }

    let userId = req.query.userId;
    let carrierId = req.params.carrierId;

    let makeApiRequest = _.partial(function(carrierId) {
      let request = new ApplicationRequest({
        baseUrl: nconf.get('mumsApi:baseUrl'),
        timeout: nconf.get('mumsApi:timeout')
      });

      return Q.ninvoke(request, 'getApplications', carrierId);
    }, carrierId);

    this.canAccessApplicationInformation(userId)
      .then((isPermitted) => {
        if (!isPermitted) {
          res.status(401).json({
            error: new Error('unauthorized user')
          });
          return;
        }

        return makeApiRequest()
          .then((result) => {
            // result can be an object or array depends on the number of applications
            // object if 1, array if multiple
            // therefore we unify the structure here to array
            if (!_.isArray(result)) {
              result = [result];
            }

            let appIds = [];
            _.forEach(result, (app) => {
              appIds.push(app.applicationId);
            });

            res.status(200).json(appIds);
          })
          .catch((err) => {
            logger.error(err);
            let error = this.createResponseError(_.get(err, 'response.body.error') || err);

            res.status(error.status).json({
              error: {
                message: error.message
              }
            });
          });
      })
      .catch((err) => {
        logger.error(err);

        res.status(err.status).json({
          error: {
            message: err.message
          }
        });
      })
      .done();
  }

  /**
   * Acquire the application service configs with carrierId
   *
   * @method
   * @param {Request} req  The node request object
   * @param {Response} res  The node response object
   */
  getApplications(req, res) {
    req.checkParams('carrierId').notEmpty();
    req.checkQuery('userId').notEmpty();

    if (req.validationErrors()) {
      return res.status(400).json({
        error: new Error('missing query parameter `userId`')
      });
    }

    let userId = req.query.userId;
    let carrierId = req.params.carrierId;

    let makeApiRequest = _.partial(function(carrierId) {
      let request = new ApplicationRequest({ baseUrl: nconf.get('mumsApi:baseUrl'), timeout: nconf.get('mumsApi:timeout') });

      return Q.allSettled([
        Q.ninvoke(request, 'getApplications', carrierId),
        Q.ninvoke(request, 'getApiService', carrierId)
      ])
        .spread((applications, services)=> {
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
              if (service.type === 'API') {
                _.merge(result, {
                  developerKey: service.key,
                  developerSecret: service.secret
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
        .catch((error)=> {
          logger.error(error);
          return null;
        });
    }, carrierId);

    this.canAccessApplicationInformation(userId)
      .then((isPermitted) => {
        if (!isPermitted) {
          res.status(401).json({
            error: new Error('unauthorized user')
          });
          return;
        }

        return makeApiRequest()
          .then((result) => {
            res.status(200).json({
              services: result,
              carrierId: req.params.carrierId
            });
          });
      })
      .catch((err) => {
        logger.error(err);

        res.status(500).json({
          error: err
        });
      })
      .done();
  }

  getInfo(req, res) {
    let { carrierId } = req.params;

    Q.ninvoke(Company, 'findOne', { carrierId: carrierId }, 'name carrierId logo')
      .then((company)=> {
        if (!company) {
          return res.status(404).json({
            error: 'company not found'
          });
        }

        return res.status(200).json({
          company: company
        });
      })
      .catch((err)=> {
        logger.error(err);
        res.status(err.status).json({
          error: err
        });
      })
      .done();
  }
}
