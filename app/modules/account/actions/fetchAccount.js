export default function (context, params, done) {
  const { apiClient } = context;
  context.dispatch('FETCH_ACCOUNT_START');
  apiClient
    .get(`accounts/${params.id}`)
    .then(account => {
      context.dispatch('FETCH_ACCOUNT_SUCCESS', account);
      done();
    })
    .catch(err => {
      context.dispatch('FETCH_ACCOUNT_FAILURE', err);
      done();
    });
}
