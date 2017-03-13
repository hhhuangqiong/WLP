import dispatchApiCall from '../../../utils/dispatchApiCall';

export default function (context, params) {
  const { carrierId } = params;
  const args = {
    context,
    eventPrefix: 'FETCH_EXPORT_CANCEL',
    url: `/carriers/${carrierId}/cancel`,
    method: 'get',
    prefix: '/export',
    query: params,
  };
  dispatchApiCall(args);
}
