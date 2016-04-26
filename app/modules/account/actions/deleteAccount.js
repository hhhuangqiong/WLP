import fetchAccounts from './fetchAccounts';

export default function (context, params, done) {
  context.dispatch('START');

  context.api.deleteAccount(params, (err, result) => {
    if (err) {
      context.dispatch('DELETE_ACCOUNT_FAILURE', err);
      return;
    }

    context.executeAction(fetchAccounts, { carrierId: params.carrierId }, () => {
      const router = context.getRouter();
      const routerParams = context.params;

      context.dispatch('DELETE_ACCOUNT_SUCCESS', result);
      router.transitionTo('account', routerParams);
      done();
    });
  });
}
