import dispatchApiCall from '../../../utils/dispatchApiCall';

export default function (context, params) {
  const { carrierId, provisionId, ...data } = params;
  const args = {
    context,
    eventPrefix: 'UPDATE_COMPANY',
    url: `/carriers/${carrierId}/provisioning/${provisionId}`,
    method: 'put',
    data,
  };
  dispatchApiCall(args);
}
