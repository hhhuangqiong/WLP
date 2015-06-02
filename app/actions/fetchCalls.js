var debug = require('debug')('app:fetchCalls');

import request from 'superagent';

export function fetchCalls(context, params, done) {
  debug('Started');

  context.dispatch('FETCH_START');
  context.dispatch('FETCH_CALLS_START');

  context.api.getCalls(params, function(err, calls) {
    calls.params = params;
    
    context.dispatch('FETCH_CALLS_END');
    context.dispatch('FETCH_END');
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
