var debug = require('debug')('wlp:fetchSMS');

export default function fetchSMS(context, params, done) {
  debug('Started');
  context.dispatch('FETCH_SMS_START');
  context.api.getSMS(params, function(err, result) {
    if (err) {
      debug('Failed');
      context.dispatch('FETCH_SMS_FAILURE', err);
      done();
      return;
    }

    debug('Success');
    context.dispatch('FETCH_SMS_SUCCESS', result);
    done();
  });
};
