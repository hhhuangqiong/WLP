export default function (context, params) {
  const { apiClient } = context;
  const { carrierId, ...query } = params;
  return apiClient
    .get(`/carriers/${carrierId}/accounts`, { query })
    .then(result => {
      context.dispatch('FETCH_ACCOUNTS_SUCCESS', result);
    }).catch(err => {
      context.dispatch('FETCH_ACCOUNTS_FAILURE', err);
    });
}
