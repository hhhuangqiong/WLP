export default function (context, params, done) {
  const { token, ...accountInfo } = params;
  context.api.createAccount((accountInfo), err => {
    if (err) {
      // change the error object to pass the token and account id
      err.token = token;
      err.accountId = accountInfo.id;
      context.dispatch('CREATE_ACCOUNT_FAILURE', err);
    } else {
      context.dispatch('CREATE_ACCOUNT_SUCCESS', { token });
    }
    done();
  });
}
