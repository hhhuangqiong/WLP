import dispatchApiCall from '../../../utils/dispatchApiCall';

export default function (context, params) {
  const { carrierId } = params;
  const args = {
    context,
    eventPrefix: 'FETCH_END_USERS_STATS_MONTHLY',
    url: `/carriers/${carrierId}/userStatsMonthly`,
    method: 'get',
    query: params,
  };
  dispatchApiCall(args);
}
