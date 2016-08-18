import _ from 'lodash';

export default function companyController(iamServiceClient, applicationRequest, provisionHelper) {
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

  async function updateCompany(req, res, next) {
    try {
      const command = _.extend({}, req.body, req.params);
      await iamServiceClient.putCompany(command);
      const company = await iamServiceClient.getCompany({ id: command.companyId });
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
      // include the company itself
      result.items.unshift(company);
      const companyIds = _.map(result.items, item => item.id);
      const carrierIds = await provisionHelper.getCarrierIdsByCompanyIds(companyIds);
      const resultArray = [];
      _.forEach(result.items, (item, index) => {
        // only filter the companies with carrier Id
        if (carrierIds[index]) {
          const mItem = item;
          mItem.carrierId = carrierIds[index];
          resultArray.push(mItem);
        }
      });
      res.json(resultArray);
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
    getManagingCompanies,
    updateCompany,
    reactivateCompany,
    deactivateCompany,
  };
}
