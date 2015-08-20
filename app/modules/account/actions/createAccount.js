let debug = require('debug')('app:actions/createAccount');

export default function(context, params, done) {
  context.dispatch('START');

  context.api.createAccount(params, (err, { error, result }) => {
    if (err) {
      context.dispatch('CREATE_ACCOUNT_FAILURE', err);
      return;
    }

    if (error) {
      context.dispatch('CREATE_ACCOUNT_FAILURE', error);
      return;
    }

    context.dispatch('CREATE_ACCOUNT_SUCCESS', result);

    // Redirect to the newly created user profile
    let router = context.getRouter();
    let routerParams = router.getCurrentParams();

    router.transitionTo('account-profile', _.merge(routerParams, {
      accountId: result._id
    }));

    done();
  });
};
