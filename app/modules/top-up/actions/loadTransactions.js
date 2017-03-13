import dispatchApiCall from '../../../utils/dispatchApiCall';

export default function (context, params) {
  const { carrierId } = params;
  const args = {
    context,
    eventPrefix: 'FETCH_TOP_UP',
    url: `/carriers/${carrierId}/topup`,
    method: 'get',
    query: params,
  };
  dispatchApiCall(args);
}
