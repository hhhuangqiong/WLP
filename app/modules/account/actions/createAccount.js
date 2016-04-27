export default function (context, params, done) {
  context.api.createAccount(params, (err, { error, result }) => {
    if (err) {
      context.dispatch('CREATE_ACCOUNT_FAILURE', err);
      context.dispatch('ERROR_MESSAGE', err);
      return;
    }

    if (error) {
      context.dispatch('CREATE_ACCOUNT_FAILURE', error);
      context.dispatch('ERROR_MESSAGE', error);
      return;
    }

    context.dispatch('CREATE_ACCOUNT_SUCCESS', result);
    context.dispatch('INFO_MESSAGE', { message: 'Create account success!' });

    // Redirect to the newly created user profile
    context.router.push({
      pathname: 'account-profile',
      query: {
        accountId: result._id,
      },
    });

    done();
  });
}
