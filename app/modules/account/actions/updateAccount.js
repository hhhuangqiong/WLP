export default function (context, params, done) {
  const { token, ...accountInfo } = params;
  context.api.updateAccount(accountInfo, (err) => {
    if (err) {
      context.dispatch('UPDATE_ACCOUNT_FAILURE', err);
      context.dispatch('ERROR_MESSAGE', err);
    } else {
      context.dispatch('UPDATE_ACCOUNT_SUCCESS', { token });
      context.dispatch('INFO_MESSAGE', { message: 'Successfully update user' });
    }
    done();
  });
}
