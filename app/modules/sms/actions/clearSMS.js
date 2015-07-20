var debug = require('debug')('app:clearSMS');

export default function clearSMS(context, params, done) {
  context.dispatch('CLEAR_SMS');
  done();
};
