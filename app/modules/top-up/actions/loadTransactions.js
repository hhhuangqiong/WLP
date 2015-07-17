// the implementation is different from what used in apiActionCreator
// so I kept the boilerplate approach here

var debug = require('debug')('app:loadTransactions');

// jscs:disable
export default function loadTransactions(context, { reload, ...params }, done) {
  // jscs:enable
  debug('Started');
  context.dispatch('FETCH_TOP_UP_START');
  context.api.getTopUpHistory(params, function(err, result) {
    if (err) {
      debug('Failed');
      context.dispatch('FETCH_TOP_UP_FAILURE', err);
      done();
      return;
    }

    debug('Success');

    if (reload) {
      context.dispatch('FETCH_TOP_UP_SUCCESS', result);
    } else {
      context.dispatch('LOAD_MORE_TOP_UP_SUCCESS', result);
    }

    done();
  });
};
