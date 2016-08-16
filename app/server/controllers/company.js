import _ from 'lodash';

export default function companyController(iamServiceClient, applicationRequest, mpsClient) {
  // @TODO need to verify when integrate with company

  /**
   * @method deactivateCompany
   * Deactivate an company with a given carrierId
   *
   * @param req
   * @param res
   */
  function deactivateCompany(req, res) {
    // @TODO @IAM check if user is able to deactivate the company
    // originally it is set the company field into inactive
    // need to think of whether to be part of IAM identity or access permission deactive
    res.json();
  }

  /**
   * @method reactivateCompany
   *
   * @param req
   * @param res
   */
  function reactivateCompany(req, res) {
      // @TODO @IAM check if user is able to reactivate the company
    res.json();
  }

  /**
   * Controller Middleware
   * get all user managing Companies resource in JSON format
   *
   * @param req
   * @param res
   */
  async function getCompanies(req, res, next) {
    try {
      const command = req.query;
      command.pageSize = command.pageSize ? parseInt(command.pageSize, 10) : 5;
      command.pageNo = command.pageNumber ? parseInt(command.pageNumber, 10) : 0;
      if (command.searchCompany) {
        command.search = command.searchCompany;
        delete command.searchCompany;
      }
      const { total, pageSize, pageNo, items } = await iamServiceClient.getCompanies(command);
      res.json({
        total,
        companies: items,
        pageNumber: pageNo,
        pageSize,
      });
    } catch (ex) {
      next(ex);
    }
  }

  async function createCompany(req, res, next) {
    // @TODO check in the MPS service
    const isValid = await applicationRequest.validateCarrier(req.params.companyId);

    if (!isValid) {
      throw new Error('invalid carrier id');
    }

    /**
     * Normalize payload object
     *
     * @param provisioningData {Object} provisioning data received via Api
     * @returns {*|promise} return a normalized payload object
     */
    const normalizeParams = _.bind(function bind(provisioningData) {
      const params = _.assign({
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
          phone: this.data.bcPhone,
        },
        technicalContact: {
          name: this.data.tcName,
          email: this.data.tcEmail,
          phone: this.data.tcPhone,
        },
        supportContact: {
          name: this.data.scName,
          email: this.data.scEmail,
          phone: this.data.scPhone,
        },
        createBy: req.user._id,
        createAt: new Date(),
        updateBy: req.user._id,
        updateAt: new Date(),
      }, provisioningData);

      // if logo is not uploaded, this.data.logo will not exist
      // do not overwrite logo if logo is not uploaded
      _.merge(params, { logo: this.data.logo });

      // params.parentCompany = req.user.affiliatedCompany;
      return params;
    }, { data: req.body });

    // normalizeParams
    const param = normalizeParams(req.body);
    // provisioning
    // create company
    // upload logo
    // get company info
    // @TODO update the company id
    const company = await iamServiceClient.getCompany();
    res.status(200).json({
      company,
      carrierId: req.params.carrierId,
    });
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
  async function getApplicationIds(req, res, next) {
    try {
      const { carrierId } = req.params;
      // result can be an object or array depends on the number of applications
      // object if 1, array if multiple
      // therefore we unify the structure here to array
      const result = [].concat(await applicationRequest.getApplications(carrierId));
      const appIds = _.map(result, app => app.applicationId);
      res.json(appIds);
    } catch (ex) {
      next(ex);
    }
  }

  /**
   * Acquire the application service configs with carrierId
   *
   * @method
   * @param {Request} req  The node request object
   * @param {Response} res  The node response object
   */
  async function getApplications(req, res, next) {
    try {
      const { carrierId } = req.params;
      const applications = await applicationRequest.getApplications(carrierId);
      const services = await applicationRequest.getApiService(carrierId);
      const result = {
        applicationId: null,
        developerKey: null,
        developerSecret: null,
        applications: {
          ios: {},
          android: {},
        },
      };

      if (services.value) {
        _.filter(services.value, service => {
          if (service.type === 'API') {
            _.merge(result, {
              developerKey: service.key,
              developerSecret: service.secret,
            });
          }
        });
      }

      if (applications.value) {
        result.applicationId = applications.value.applicationId;
        _.filter(applications.value.applications, application => {
          if (application.platform.match(/.ios$/)) {
            result.applications.ios = application;
          } else if (application.platform.match(/.android$/)) {
            result.applications.android = application;
          }
        });
      }

      res.json(result);
    } catch (ex) {
      next(ex);
    }
  }

  async function updateCompany(req, res, next) {
    try {
      const command = _.extend({}, req.body, req.params);
      await iamServiceClient.putCompany(command);
      const company = await iamServiceClient.getCompany({ id: command.id });
      res.json(company);
    } catch (ex) {
      next(ex);
    }
  }

  async function getCompany(req, res, next) {
    try {
      const company = await iamServiceClient.getCompany({ id: req.params.companyId });
      res.json(company);
    } catch (ex) {
      next(ex);
    }
  }

  async function getManagingCompanies(req, res, next) {
    try {
      // ensure the existence of the company
      const company = await iamServiceClient.getCompany({ id: req.params.companyId });
      // find all the companies that under affiliated company
      // @TODO pagination handling for pageSize, expect to get all companies
      const result = await iamServiceClient.getCompanies({ parent: company.id, pageSize: 200 });
      const companyIds = _.map(result.items, item => item.id);
      const carrierIds = await mpsClient.getCarrierIdsByCompanyIds(companyIds);
      result.items = _.map(result.items, item => {
        const mItem = item;
        mItem.carrierId = carrierIds[item.id];
      });
      res.json([company].concat(result.items));
    } catch (ex) {
      next(ex);
    }
  }

  async function getCompanyRoles(req, res, next) {
    try {
      const roles = await iamServiceClient.getRoles({ company: req.params.companyId });
      res.json(roles);
    } catch (ex) {
      next(ex);
    }
  }

  return {
    getCompanyRoles,
    getCompany,
    createCompany,
    getCompanies,
    getManagingCompanies,
    updateCompany,
    getApplications,
    getApplicationIds,
    reactivateCompany,
    deactivateCompany,
  };
}
