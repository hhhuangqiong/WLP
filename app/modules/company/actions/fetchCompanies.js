import dispatchApiCall from '../../../utils/dispatchApiCall';

export default function (context, params) {
  const { carrierId, ...query } = params;
  const args = {
    context,
    eventPrefix: 'FETCH_COMPANIES',
    url: `/carriers/${carrierId}/provisioning`,
    method: 'get',
    query,
  };
  dispatchApiCall(args);
}
