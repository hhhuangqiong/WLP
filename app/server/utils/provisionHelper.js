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

  function postProvision(command) {
    return mpsClient.postProvision(command);
  }

  function putProvision(command) {
    return mpsClient.putProvision(command);
  }

  function getProvisionById(command) {
    return mpsClient.getProvisionById(command);
  }

  function getPreset(query) {
    return mpsClient.getPreset(query);
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
    await getProvision({ companyId: ids.toString() });
    // expect to be loaded into local carrierIdMapping
    return _.map(ids, id => carrierIdMapping[id] || null);
  }

  async function getCapabilityByCarrierId(id) {
    const result = await getProvision({ carrierId: id });
    if (!result.items.length) {
      return [];
    }
    return result.items[0].profile.capabilities || [];
  }

  return {
    getProvision,
    postProvision,
    getPreset,
    getCarrierIdByCompanyId,
    getCompanyIdByCarrierId,
    getCarrierIdsByCompanyIds,
    getCapabilityByCarrierId,
    putProvision,
    getProvisionById,
  };
}
