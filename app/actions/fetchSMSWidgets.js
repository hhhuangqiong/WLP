var debug = require('debug')('wlp:fetchSMSWidgets');

export default function fetchSMSWidgets(context, params, done) {
  debug('Started');
  context.dispatch('FETCH_SMS_WIDGETS_START');
  context.api.getSMSWidgets(params, function(err, result) {
    if (err) {
      debug('Failed');
      context.dispatch('FETCH_SMS_WIDGETS_FAILURE', err);
      done();
      return;
    }

    debug('Success');
    context.dispatch('FETCH_SMS_WIDGETS_SUCCESS', result);
    done();
  });
};
