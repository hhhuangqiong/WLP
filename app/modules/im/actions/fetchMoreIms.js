import dispatchApiCall from '../../../utils/dispatchApiCall';

export default function (context, params) {
  const { carrierId } = params;
  const args = {
    context,
    eventPrefix: 'FETCH_MORE_IM',
    url: `/carriers/${carrierId}/im`,
    method: 'get',
    query: params,
  };
  dispatchApiCall(args);
}
