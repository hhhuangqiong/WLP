import _ from 'lodash';

export default function provisionController(iamServiceClient, provisionHelper) {
  async function createProvision(req, res, next) {
    try {
      const data = {
        companyInfo: {
          name: req.body.name,
          timezone: req.body.timezone,
        },
        companyCode: req.body.code,
        country: req.body.country,
        resellerCompanyId: req.body.resellerCompanyId,
        resellerCarrierId: req.body.resellerCarrierId,
        capabilities: req.body.capabilities,
        serviceType: req.body.companyType,
        paymentMode: req.body.paymentType,
        // @TODO temp workaround, expect to fetch preset and merge with the data
        smsc: {
          needBilling: false,
          defaultRealm: 'WhiteLabel',
          servicePlanId: 'whitelabel',
          sourceAddress: 1234567899,
        },
        billing: {
          offnetPackageId: 1,
          currency: 840,
        },
      };
      const result = await provisionHelper.postProvision(data);
      res.json(result);
    } catch (ex) {
      next(ex);
    }
  }

  async function getProvisions(req, res, next) {
    try {
      const pageSize = req.query.pageSize ? parseInt(req.query.pageSize, 10) : 5;
      // convert from 0 base to 1 base
      const pageNo = 1 + (req.query.pageNumber ? parseInt(req.query.pageNumber, 10) : 0);
      // first get from the MPS to have a full list of provisioning
      // independent of pagination and search
      const provisioningQuery = { pageSize, page: pageNo };
      if (req.query.searchCompany) {
        provisioningQuery.search = req.query.searchCompany;
      }
      const provisionResult = await provisionHelper.getProvision(provisioningQuery);
      const companyIds = _.map(provisionResult.items, item => item.profile.companyId);
      const filterCompanyIds = _.filter(companyIds, id => !!id);

      let companyResult;
      if (filterCompanyIds.length) {
        // ask the identity to get all the company information, perform search and pagination
        companyResult = await iamServiceClient.getCompanies({
          ids: filterCompanyIds.toString(),
          pageSize,
        });
      }
      // join back the status from iam
      // update the format for the front end
      const result = _.map(provisionResult.items, item => {
        let targetCompanyName = '';
        if (item.profile.companyId) {
          // since they are not in order according to the ids, find it ourself
          const targetCompany = _.find(companyResult.items, company =>
            company.id === item.profile.companyId) || {};
          targetCompanyName = targetCompany.name || targetCompanyName;
        }

        return {
          id: item.id,
          companyName: targetCompanyName,
          domain: item.profile.carrierId,
          createDate: item.createdAt,
          status: item.status,
        };
      });

      res.json({
        total: provisionResult.pageTotal,
        companies: result,
        pageNumber: provisionResult.page,
        pageSize: provisionResult.pageSize,
      });
    } catch (ex) {
      next(ex);
    }
  }

  async function getProvision(req, res, next) {
    try {
      const provisionItem = await provisionHelper.getProvisionById({ id: req.params.provisionId });
      // append the company data
      if (provisionItem.profile && provisionItem.profile.companyId) {
        provisionItem.company = await iamServiceClient.getCompany({ id: provisionItem.profile.companyId });
      }
      res.json(provisionItem);
    } catch (ex) {
      next(ex);
    }
  }

  async function putProvision(req, res, next) {
    try {
      const command = _.extend({}, req.params, req.query, { roles: req.body });
      const company = await provisionHelper.putProvision(command);
      res.json(company);
    } catch (ex) {
      next(ex);
    }
  }

  return {
    createProvision,
    getProvision,
    getProvisions,
    putProvision,
  };
}
