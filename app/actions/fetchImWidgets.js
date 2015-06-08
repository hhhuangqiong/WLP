var debug = require('debug')('wlp:fetchImWidgets');

export default function fetchImWidgets(context, params, done) {
  debug('Started');
  context.dispatch('FETCH_IM_WIDGETS_START');
  context.api.getImWidgets(params, function(err, result) {
    if (err) {
      debug('Failed');
      context.dispatch('FETCH_IM_WIDGETS_FAILURE', err);
      done();
      return;
    }

    debug('Success');
    context.dispatch('FETCH_IM_WIDGETS_SUCCESS', result);
    done();
  });
};
