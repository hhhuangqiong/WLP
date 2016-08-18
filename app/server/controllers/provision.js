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
      // ask the identity to get all the company information, perform search and pagination
      const companyResult = await iamServiceClient.getCompanies({
        ids: companyIds.toString(),
        page: pageNo,
        pageSize,
      });
      // join back the status from iam
      // update the format for the front end
      const result = _.map(provisionResult.items, (item, index) => ({
        id: item.id,
        companyName: companyResult.items[index] && companyResult.items[index].name,
        domain: item.profile.carrierId,
        createDate: item.createdAt,
        status: item.status,
      }));

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
      const provision = await provisionHelper.getProvisionById({ id: req.params.provisionId });
      const item = provision.items[0];
      // fail to find the provision item
      if (!item) {
        res.json({});
        return;
      }
      // append the company data
      if (item.profile.companyId) {
        item.company = await iamServiceClient.getCompany({ id: item.profile.companyId });
      }
      res.json(item);
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
