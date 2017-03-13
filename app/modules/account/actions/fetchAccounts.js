import dispatchApiCall from '../../../utils/dispatchApiCall';

export default function (context, params) {
  const { carrierId, ...query } = params;
  const args = {
    context,
    eventPrefix: 'FETCH_ACCOUNTS',
    url: `/carriers/${carrierId}/accounts`,
    method: 'get',
    query,
  };
  dispatchApiCall(args);
}
