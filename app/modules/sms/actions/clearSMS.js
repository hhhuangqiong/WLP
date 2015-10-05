let debug = require('debug')('app:modules/sms/actions/clearSMS');

export default function clearSMS(context, params, done) {
  context.dispatch('CLEAR_SMS');
  done();
};
