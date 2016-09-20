export default function (context, params) {
  const { apiClient } = context;
  const { token, id, carrierId } = params;
  return apiClient
    .delete(`/carriers/${carrierId}/accounts/${id}`)
    .then(() => {
      context.dispatch('DELETE_ACCOUNT_SUCCESS', { token });
    }).catch(err => {
      context.dispatch('DELETE_ACCOUNT_FAILURE', err);
    });
}
