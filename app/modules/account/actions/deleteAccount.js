let debug = require('debug')('app:actions/deleteAccount');

import fetchAccounts from './fetchAccounts';

export default function(context, params, done) {
  context.dispatch('START');

  context.api.deleteAccount(params, (err, result) => {
    if (err) {
      context.dispatch('DELETE_ACCOUNT_FAILURE', err);
      return;
    }

    context.executeAction(fetchAccounts, { carrierId: params.carrierId }, () => {
      let router = context.getRouter();
      let routerParams = router.getCurrentParams();

      context.dispatch('DELETE_ACCOUNT_SUCCESS', result);
      router.transitionTo('account', routerParams);
      done();
    });
  });
}
