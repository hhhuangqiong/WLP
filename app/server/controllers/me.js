import Q from 'q';
import { merge, get, map, forEach, filter } from 'lodash';

export default function meController(aclResolver, iamClient, provisionHelper, meControllerOptions) {
  async function getCurrentUser(req, res, next) {
    try {
      const user = req.user;
      // return 404 if no user
      if (!user) {
        res.sendStatus(404);
        return;
      }

      const carrierId = req.params.carrierId;
      const [profile, permissionsAndCapabilities] = await Q.all([
        iamClient.getUser({ id: user.username }),
        aclResolver.resolve({
          username: user.username,
          carrierId,
        }),
      ]);
      const identity = merge({}, user, profile, permissionsAndCapabilities);
      res.json(identity);
    } catch (e) {
      next(e);
    }
  }

  async function getCompanies(req, res, next) {
    try {
      const user = get(req, 'user');
      const affiliatedCompany = get(req, 'user.affiliatedCompany');
      // return 404 if no user
      if (!user || !affiliatedCompany) {
        res.sendStatus(404);
        return;
      }

      // Ensure the existence of affiliated company
      const company = await iamClient.getCompany({ id: affiliatedCompany });
      // find all the companies that under affiliated company
      const result = await iamClient.getDescendantCompany({ id: company.id });
      // append the current company at the front
      result.unshift(company);
      const companyIds = map(result, item => item.id);
      const carrierIds = await provisionHelper.getCarrierIdsByCompanyIds(companyIds);
      const roles = await iamClient.getUserRoles({ userId: user.username });
      const resultArray = [];
      const { rewriteLogoPath } = meControllerOptions;
      forEach(result, (item, index) => {
        // only filter the companies with carrier Id
        if (!carrierIds[index]) {
          return;
        }
        // get user roles on that company
        const userRoles = filter(roles, role => role.company === item.id);
        if (!userRoles.length) {
          return;
        }
        const mItem = item;
        mItem.roles = userRoles;
        mItem.carrierId = carrierIds[index];
        // rewrite the logo path
        if (item.logo && rewriteLogoPath) {
          mItem.logo = item.logo.replace(rewriteLogoPath.original, rewriteLogoPath.new);
        }
        resultArray.push(mItem);
      });
      res.json(resultArray);
    } catch (ex) {
      next(ex);
    }
  }

  return {
    getCurrentUser,
    getCompanies,
  };
}
