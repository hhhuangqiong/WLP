import _ from 'lodash';
const EMPTY_VALUE = '-';

function buildProvisionData(data) {
  return {
    companyInfo: {
      name: data.companyName,
      timezone: data.timezone,
    },
    companyCode: data.companyCode,
    country: data.country,
    resellerCompanyId: data.resellerCompanyId,
    resellerCarrierId: data.resellerCarrierId,
    capabilities: data.capabilities,
    serviceType: data.companyType,
    paymentMode: data.paymentType,
  };
}

function parseResponse(provisionItem, company = {}, preset = {}) {
  const formatedPreset = {};
  if (preset.paymentMode) {
    formatedPreset.paymentType = preset.paymentMode;
  }
  if (preset.serviceType) {
    formatedPreset.companyType = preset.serviceType;
  }
  if (preset.capabilities) {
    formatedPreset.capabilities = preset.capabilities;
  }
  // format the response and return the necessary data
  return {
    companyId: company.id,
    companyName: company.name,
    timezone: company.timezone,
    country: company.country,
    companyCode: provisionItem.profile.companyCode,
    capabilities: provisionItem.profile.capabilities,
    companyType: provisionItem.profile.serviceType,
    paymentType: provisionItem.profile.paymentMode,
    resellerCarrierId: provisionItem.profile.resellerCarrierId,
    resellerCompanyId: provisionItem.profile.resellerCompanyId,
    status: provisionItem.status,
    id: provisionItem.id,
    preset: formatedPreset,
  };
}

export default function provisionController(iamServiceClient, provisionHelper) {
  async function createProvision(req, res, next) {
    try {
      const provisionData = buildProvisionData(req.body);
      const result = await provisionHelper.postProvision(provisionData);
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
      const provisioningQuery = { pageSize, page: pageNo, resellerCarrierId: req.query.carrierId };
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
          companyName: targetCompanyName || EMPTY_VALUE,
          domain: item.profile.carrierId || EMPTY_VALUE,
          paymentType: item.profile.paymentMode,
          chargeWallet: item.profile.chargeWallet,
          createDate: item.createdAt,
          status: item.status,
        };
      });

      res.json({
        total: provisionResult.pageTotal,
        totalElements: provisionResult.total,
        companies: result,
        // MPS returns pages starting from 1, converting to 0-based for consistency
        pageNumber: provisionResult.page - 1,
        pageSize: provisionResult.pageSize,
      });
    } catch (ex) {
      next(ex);
    }
  }

  async function getProvision(req, res, next) {
    try {
      let company = {};
      let preset = {};
      const provisionItem = await provisionHelper.getProvisionById({ id: req.params.provisionId });
      // append the company data
      if (provisionItem.profile) {
        if (provisionItem.profile.companyId) {
          company = await iamServiceClient.getCompany({ id: provisionItem.profile.companyId });
        }
        if (provisionItem.profile.resellerCarrierId) {
          preset = await provisionHelper.getPresetByCarrierId(provisionItem.profile.resellerCarrierId);
        }
      }
      const result = parseResponse(provisionItem, company, preset);
      res.json(result);
    } catch (ex) {
      next(ex);
    }
  }

  async function putProvision(req, res, next) {
    try {
      const provisionData = buildProvisionData(req.body);
      provisionData.id = req.params.provisionId;
      const result = await provisionHelper.putProvision(provisionData);
      res.json(result);
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
