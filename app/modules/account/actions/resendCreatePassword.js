import dispatchApiCall from '../../../utils/dispatchApiCall';

export default function (context, params) {
  const { carrierId, id } = params;
  const args = {
    context,
    eventPrefix: 'RESEND_CREATE_PASSWORD',
    url: `/carriers/${carrierId}/accounts/${encodeURIComponent(id)}/requestSetPassword`,
    method: 'post',
  };
  dispatchApiCall(args);
}
