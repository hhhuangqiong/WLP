import dispatchApiCall from '../../../utils/dispatchApiCall';

export default function (context, params) {
  const { carrierId } = params;
  const args = {
    context,
    eventPrefix: 'FETCH_END_USERS_STATS_TOTAL',
    url: `/carriers/${carrierId}/userStatsTotal`,
    method: 'get',
    query: params,
  };
  dispatchApiCall(args);
}
