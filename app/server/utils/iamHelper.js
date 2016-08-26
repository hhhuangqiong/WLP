import _ from 'lodash';
import { ArgumentError } from 'common-errors';

export default function iamHelper(iamServiceClient, provisionHelper) {
  async function getManagingCompanies(user, affiliatedCompany) {
    if (!affiliatedCompany) {
      throw new ArgumentError('affiliatedCompany');
    }
    // Ensure the existence of affiliated company
    const company = await iamServiceClient.getCompany({ id: affiliatedCompany });
    // find all the companies that under affiliated company
    const result = await iamServiceClient.getDescendantCompany({ id: company.id });
    // append the current company at the front
    result.unshift(company);
    const companyIds = _.map(result, item => item.id);
    const carrierIds = await provisionHelper.getCarrierIdsByCompanyIds(companyIds);
    const roles = await iamServiceClient.getUserRoles({ userId: user.username });
    const resultArray = [];
    _.forEach(result, (item, index) => {
      // only filter the companies with carrier Id
      if (!carrierIds[index]) {
        return;
      }
      // get user roles on that company
      const userRoles = _.filter(roles, role => role.company === item.id);
      if (!userRoles.length) {
        return;
      }
      const mItem = item;
      mItem.roles = userRoles;
      mItem.carrierId = carrierIds[index];
      resultArray.push(mItem);
    });
    return resultArray;
  }

  async function getCompanyByCarrierId(carrierId) {
    const companyId = await provisionHelper.getCompanyIdByCarrierId(carrierId);
    const company = await iamServiceClient.getCompany({ id: companyId });
    // append the carrier into the company
    company.carrierId = carrierId;
    return company;
  }

  return {
    getManagingCompanies,
    getCompanyByCarrierId,
  };
}
