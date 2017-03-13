import dispatchApiCall from '../../../utils/dispatchApiCall';

export default function (context, params) {
  const args = {
    context,
    eventPrefix: 'FETCH_CALLS_STATS_TOTAL',
    url: `/carriers/${params.carrierId}/callUserStatsTotal`,
    method: 'get',
    query: params,
  };
  dispatchApiCall(args);
}
