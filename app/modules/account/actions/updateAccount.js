import dispatchApiCall from '../../../utils/dispatchApiCall';

export default function (context, params) {
  const { token, carrierId, id, ...data } = params;
  const args = {
    context,
    eventPrefix: 'UPDATE_ACCOUNT',
    url: `/carriers/${carrierId}/accounts/${encodeURIComponent(id)}`,
    method: 'put',
    data,
    token,
  };
  dispatchApiCall(args);
}
