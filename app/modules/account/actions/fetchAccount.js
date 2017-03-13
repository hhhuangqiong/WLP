import dispatchApiCall from '../../../utils/dispatchApiCall';

export default function (context, params) {
  const { carrierId, id } = params;
  const args = {
    context,
    eventPrefix: 'FETCH_ACCOUNT',
    url: `/carriers/${carrierId}/accounts/${encodeURIComponent(id)}`,
    method: 'get',
  };
  dispatchApiCall(args);
}
