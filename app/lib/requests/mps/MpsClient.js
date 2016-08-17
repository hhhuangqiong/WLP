import Q from 'q';
import _ from 'lodash';
// @TODO need to update when integrating with MPS service

// local mapping between carrier and company id,
// key is company id and value is carrier id.
const carrierIdMapping = {
  '57a950b9cdf9005630e797f8': 'bolter.maaiii.org',
  '57b03e91121a6ac6664b51a5': 'bolter-child.maaiii.org',
  '57a950b9cdf9005630e797fc': 'm800',
  '57a950b9cdf9005630e797fd': 'maaiii.org',
};

export function getCarrierIdByCompanyId(id) {
  // @TODO update when get the mapping of company id to carrier id
  function fetchCompanyMapping(companyId) {
    carrierIdMapping[companyId] = 'carrierA';
    return carrierIdMapping[companyId];
  }
  return Q.resolve(carrierIdMapping[id] || fetchCompanyMapping(id));
}

export default class MpsClient {
  getCompanyIdByCarrierId(id) {
    const companyId = _.invert(carrierIdMapping)[id];
    return Q.resolve(companyId);
  }
  getCarrierIdByCompanyId(id) {
    return Q.resolve(carrierIdMapping[id]);
  }
  getCarrierIdsByCompanyIds(ids) {
    const result = {};
    const resultPromise = _.map(ids, id => this.getCarrierIdByCompanyId(id)
      .then(carrierId => {
        result[id] = carrierId;
      }));
    return Q.all(resultPromise).then(() => result);
  }
  getCapabilityByCarrierId() {
    return Q.resolve([
      'service.white_label',
      'device.ios',
      'device.android',
      'sign_up.flow.standard',
      'sign_up.flow.customized',
      'end-user',
      'call.onnet_call',
      'call.offnet_call',
      'call',
      'im.im_to_sms',
      'im.client_to_client',
      'im.server_to_client',
      'im.client_to_server',
      'im',
      'sms',
      'vsf.item.sticker',
      'vsf.item.animation',
      'vsf.item.audio_effect',
      'vsf.item.credit',
      'vsf.item.customized',
      'vsf',
      'top_up',
      'wallet',
      'wallet.none',
      'wallet.single',
      'wallet.multiple',
      'wallet.shared',
    ]);
  }
}
