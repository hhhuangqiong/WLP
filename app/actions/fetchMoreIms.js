var debug = require('debug')('wlp:fetchMoreIms');

export default function(context, params, done) {
  debug('Started');

  context.dispatch('FETCH_START');
  context.api.getImHistory(params, function(err, Im) {
    context.dispatch('FETCH_END');
    if (err) {
      debug('Failed');
      context.dispatch('FETCH_MORE_IM_FAILURE', err);
      done();
      return;
    }

    debug('Success');
    context.dispatch('FETCH_MORE_IM_SUCCESS', Im);
    done();
  });

};
