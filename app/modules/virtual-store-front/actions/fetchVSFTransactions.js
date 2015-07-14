const debug = require('debug')('src:modules/virtual-store-front/actions/fetchVSFTransactions');

export default function(context, params, done) {
  debug('fetch started', params);

  context.dispatch('FETCH_START');
  context.api.getVSFTransactions(params, function(err, transactions) {
    // Notify spinner to quit
    context.dispatch('FETCH_END');

    if (err) {
      debug('Failed');
      context.dispatch('FETCH_VSF_FAILURE', err);
      done();
      return;
    }

    debug('Success');
    context.dispatch('FETCH_VSF_SUCCESS', transactions);
    done();
  });

};
