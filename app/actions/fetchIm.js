var debug = require('debug')('app:fetchIm');

import request from 'superagent';

export function fetchIm(context, params, done) {
  debug('Started');

  context.dispatch('FETCH_START');
  context.dispatch('FETCH_IM_START');

  context.api.getImHistory(params, function(err, Im) {

    context.dispatch('FETCH_IM_END');
    context.dispatch('FETCH_END');
    if (err) {
      debug('Failed');
      context.dispatch('FETCH_IM_FAILURE', err);
      done();
      return;
    }

    debug('Success');

    context.dispatch('FETCH_IM_SUCCESS', Im);
    done();
  });

};
