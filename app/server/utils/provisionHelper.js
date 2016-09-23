import _ from 'lodash';

export default function provisionHelper(mpsClient) {
  // Since it is heavily since the carrierId and companyId conversion,
  // I will store the mapping locally
  // local mapping between carrier and company id,
  // key is company id and value is carrier id.
  // example
  // '57a950b9cdf9005630e797f8': 'bolter.maaiii.org',
  const carrierIdMapping = {};

  async function getProvision(query) {
    const result = await mpsClient.getProvision(query);
    // extra process to cache all the carrier id and company id relationship
    _.forEach(result.items, item => {
      if (item.profile.companyId && item.profile.carrierId) {
        carrierIdMapping[item.profile.companyId] = item.profile.carrierId;
      }
    });
    return result;
  }

  async function postProvision(command) {
    return mpsClient.postProvision(command);
  }

  async function putProvision(command) {
    return mpsClient.putProvision(command);
  }

  async function getProvisionById(command) {
    const provisionResult = await mpsClient.getProvisionById(command);
    if (!provisionResult.items.length) {
      return {};
    }
    return provisionResult.items[0];
  }

  async function getProvisionByCarrierId(id) {
    const provisionResult = await getProvision({ carrierId: id });
    if (!provisionResult.items.length) {
      return {};
    }
    return provisionResult.items[0];
  }

  async function getProvisionByCompanyId(companyId) {
    const provisionsPage = await getProvision({ companyId });
    if (!provisionsPage.items.length) {
      return null;
    }
    return provisionsPage.items[0];
  }

  async function getPresetByCarrierId(id) {
    try {
      return await mpsClient.getPreset({ presetId: id });
    } catch (ex) {
      // since it will throw toJSON null at this moment
      return {};
    }
  }

  async function getCompanyIdByCarrierId(id) {
    let companyId = _.invert(carrierIdMapping)[id];
    if (companyId) {
      return companyId;
    }
    await getProvision({ carrierId: id });
    companyId = _.invert(carrierIdMapping)[id];
    return companyId || null;
  }

  async function getCarrierIdByCompanyId(id) {
    // early return if exist
    if (carrierIdMapping[id]) {
      return carrierIdMapping[id];
    }
    // send request to get one and save into the local carrierId Mapping,
    // expect the above will local into the mapping
    await getProvision({ companyId: id });
    return carrierIdMapping[id] || null;
  }

  async function getCarrierIdsByCompanyIds(ids) {
    // since it is heavy to check local and send every time
    // now send it server directly and map it afterward.
    // @TODO support larger size
    await getProvision({ companyId: ids.toString(), pageSize: 50 });
    // expect to be loaded into local carrierIdMapping
    return _.map(ids, id => carrierIdMapping[id] || null);
  }

  return {
    getProvision,
    postProvision,
    getPresetByCarrierId,
    getCarrierIdByCompanyId,
    getCompanyIdByCarrierId,
    getCarrierIdsByCompanyIds,
    putProvision,
    getProvisionById,
    getProvisionByCarrierId,
    getProvisionByCompanyId,
  };
}
