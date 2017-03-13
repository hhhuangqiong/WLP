import dispatchApiCall from '../../../utils/dispatchApiCall';

export default function (context, params) {
  const args = {
    context,
    eventPrefix: 'FETCH_CALLS',
    url: `/carriers/${params.carrierId}/calls`,
    method: 'get',
    query: params,
  };
  dispatchApiCall(args);
}
