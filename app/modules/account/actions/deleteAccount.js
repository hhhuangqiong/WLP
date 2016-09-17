export default function (context, params, done) {
  context.dispatch('START');
  const { token, ...accountDetail } = params;
  context.api.deleteAccount(accountDetail, (err) => {
    if (err) {
      context.dispatch('DELETE_ACCOUNT_FAILURE', err);
    } else {
      context.dispatch('DELETE_ACCOUNT_SUCCESS', { token });
    }
    done();
  });
}
