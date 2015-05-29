var debug = require('debug')('app:fetchCalls');

import request from 'superagent';

export function fetchCalls(context, params, done) {
  debug('Started');

  var start = setTimeout(function() {
    context.dispatch('FETCH_CALLS_START');
  }, 2000);

  context.api.getCalls(params, function(err, calls) {

    clearTimeout(start);
    context.dispatch('FETCH_CALLS_END');

    if (err) {
      debug('Failed');
      context.dispatch('FETCH_CALLS_FAILURE', err);
      done();
      return;
    }

    debug('Success');
    context.dispatch('FETCH_CALLS_SUCCESS', calls);
    done();
  });

};
