import dispatchApiCall from '../../../utils/dispatchApiCall';

export default function (context, params) {
  const { token, carrierId, id } = params;
  const args = {
    context,
    eventPrefix: 'DELETE_ACCOUNT',
    url: `/carriers/${carrierId}/accounts/${encodeURIComponent(id)}`,
    method: 'delete',
    token,
  };
  dispatchApiCall(args);
}
