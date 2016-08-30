export default function (context, params, done) {
  const { token, ...accountInfo } = params;
  context.api.createAccount((accountInfo), (err) => {
    if (err) {
      context.dispatch('CREATE_ACCOUNT_FAILURE', err);
      context.dispatch('ERROR_MESSAGE', err);
    } else {
      context.dispatch('CREATE_ACCOUNT_SUCCESS', token);
      context.dispatch('INFO_MESSAGE', { message: 'Create account success!' });
    }
    done();
  });
}
