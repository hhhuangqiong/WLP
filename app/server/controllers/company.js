import _ from 'lodash';
import proxy from 'http-proxy-middleware';

export default function companyController(iamServiceClient, provisionHelper, companyControllerOptions) {
  async function updateCompany(req, res, next) {
    try {
      const command = _.extend({}, req.body, { id: req.params.companyId });
      await iamServiceClient.putCompany(command);
      const company = await iamServiceClient.getCompany({ id: command.id });
      res.json(company);
    } catch (ex) {
      next(ex);
    }
  }

  async function getManagingCompaniesRoles(req, res, next) {
    try {
      const companyId = await provisionHelper.getCompanyIdByCarrierId(req.params.carrierId);
      // ensure the existence of the company
      const company = await iamServiceClient.getCompany({ id: companyId });
      // find all the companies that under affiliated company
      const result = await iamServiceClient.getDescendantCompany({ id: company.id });
      // include the company itself
      result.unshift(company);
      // get all the roles for each company
      for (const comp of result) {
        comp.roles = await iamServiceClient.getRoles({ company: comp.id });
      }
      // format the data that for front end
      const resultArray = _.map(result, mCompany => {
        const resultCompany = _.pick(mCompany, ['name', 'id']);
        resultCompany.roles = _.map(mCompany.roles, comp => _.pick(comp, ['id', 'name']));
        return resultCompany;
      });
      res.json(resultArray);
    } catch (ex) {
      next(ex);
    }
  }

  function getLogo() {
    return proxy(companyControllerOptions.proxy);
  }

  return {
    getManagingCompaniesRoles,
    updateCompany,
    getLogo,
  };
}
