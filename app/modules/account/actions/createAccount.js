export default function (context, params) {
  const { apiClient } = context;
  const { token, carrierId, ...data } = params;
  return apiClient
    .post(`/carriers/${carrierId}/accounts`, { data })
    .then(() => {
      context.dispatch('CREATE_ACCOUNT_SUCCESS', { token });
    }).catch(err => {
      // change the error object to pass the token and account id
      err.token = token;
      err.accountId = data.id;
      context.dispatch('CREATE_ACCOUNT_FAILURE', err);
    });
}
