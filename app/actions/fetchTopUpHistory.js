var debug = require('debug')('wlp:fetchTopUpHistory');

export default function fetchTopUpHistory(context, params, done) {
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
    context.dispatch('FETCH_TOP_UP_SUCCESS', result);
    done();
  });
};
