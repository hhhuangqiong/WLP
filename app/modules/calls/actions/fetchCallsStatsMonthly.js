import dispatchApiCall from '../../../utils/dispatchApiCall';

export default function (context, params) {
  const args = {
    context,
    eventPrefix: 'FETCH_CALLS_STATS_MONTHLY',
    url: `/carriers/${params.carrierId}/callUserStatsMonthly`,
    method: 'get',
    query: params,
  };
  dispatchApiCall(args);
}
