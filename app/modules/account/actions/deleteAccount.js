export default function (context, params, done) {
  context.dispatch('START');
  const { token, ...accountDetail } = params;
  context.api.deleteAccount(accountDetail, (err) => {
    if (err) {
      context.dispatch('DELETE_ACCOUNT_FAILURE', err);
      context.dispatch('ERROR_MESSAGE', err);
    } else {
      context.dispatch('DELETE_ACCOUNT_SUCCESS', token);
      context.dispatch('INFO_MESSAGE', { message: 'Delete account success!' });
    }
    done();
  });
}
