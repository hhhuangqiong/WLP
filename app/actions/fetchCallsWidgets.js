var debug = require('debug')('wlp:fetchCallsWidgets');

export default function fetchCallsWidgets(context, params, done) {
  debug('Started');
  context.dispatch('FETCH_CALLS_WIDGETS_START');
  context.api.getCallsWidgets(params, function(err, result) {
    if (err) {
      debug('Failed');
      context.dispatch('FETCH_CALLS_WIDGETS_FAILURE', err);
      done();
      return;
    }

    debug('Success');
    context.dispatch('FETCH_CALLS_WIDGETS_SUCCESS', result);
    done();
  });
};
