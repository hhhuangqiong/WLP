import dispatchApiCall from '../../utils/dispatchApiCall';

export default function (context, params) {
  const args = {
    context,
    eventPrefix: 'FETCH_APP_IDS',
    url: `/carriers/${params.carrierId}/applicationIds`,
    method: 'get',
  };
  dispatchApiCall(args);
}
