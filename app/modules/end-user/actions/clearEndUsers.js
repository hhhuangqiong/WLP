var debug = require('debug')('app:clearEndUsers');

export default function(context, done) {
  context.dispatch('CLEAR_END_USERS');
  done();
};
