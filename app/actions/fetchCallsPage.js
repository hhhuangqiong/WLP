var debug = require('debug')('app:fetchCallsPage');

import request from 'superagent';

export function fetchCallsPage(context, params, done) {
  debug('Started');

  context.dispatch('FETCH_START');
  context.dispatch('FETCH_CALLS_PAGE_START');

  context.api.getCalls(params, function(err, calls) {
    calls.params = params;
    
    context.dispatch('FETCH_END');
    if (err) {
      debug('Failed');
      context.dispatch('FETCH_CALLS_PAGE_FAILURE', err);
      done();
      return;
    }

    debug('Success');
    context.dispatch('FETCH_CALLS_PAGE_SUCCESS', calls);
    done();
  });

};
