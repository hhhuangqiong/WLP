export default function (context, params) {
  const { apiClient } = context;
  const { carrierId, id } = params;
  return apiClient
    .post(`/carriers/${carrierId}/accounts/${id}/requestSetPassword`)
    .then(result => {
      context.dispatch('RESEND_CREATE_PASSWORD_SUCCESS', result);
    }).catch(err => {
      context.dispatch('RESEND_CREATE_PASSWORD_FAILURE', err);
    });
}
