var debug = require('debug')('wlp:fetchMoreCalls');

export default function(context, params, done) {
  debug('Started');
  context.dispatch('FETCH_START');
  context.api.getCalls(params, function(err, calls) {
    context.dispatch('FETCH_END');
    if (err) {
      debug('Failed');
      context.dispatch('FETCH_MORE_CALLS_FAILURE', err);
      done();
      return;
    }

    debug('Success');
    context.dispatch('FETCH_MORE_CALLS_SUCCESS', calls);
    done();
  });

};
