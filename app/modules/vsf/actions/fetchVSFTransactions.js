import dispatchApiCall from '../../../utils/dispatchApiCall';

export default function fetchVsfSummaryStats(context, params) {
  const { carrierId } = params;
  const args = {
    context,
    eventPrefix: 'FETCH_VSF',
    url: `/carriers/${carrierId}/vsf`,
    method: 'get',
    query: params,
  };
  dispatchApiCall(args);
}
