export default function (context, params) {
  const { apiClient } = context;
  const { token, carrierId, id, ...data } = params;
  return apiClient
    .put(`/carriers/${carrierId}/accounts/${encodeURIComponent(id)}`, { data })
    .then(() => {
      context.dispatch('UPDATE_ACCOUNT_SUCCESS', { token });
    }).catch(err => {
      context.dispatch('UPDATE_ACCOUNT_FAILURE', err);
    });
}
