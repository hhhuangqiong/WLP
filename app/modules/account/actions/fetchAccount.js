export default function (context, params) {
  const { apiClient } = context;
  const { carrierId, id } = params;
  return apiClient
    .get(`/carriers/${carrierId}/accounts/${id}`)
    .then(account => {
      context.dispatch('FETCH_ACCOUNT_SUCCESS', account);
    }).catch(err => {
      context.dispatch('FETCH_ACCOUNT_FAILURE', err);
    });
}
