let debug = require('debug')('app:modules/top-up/actions/clearVSFTransaction');

export default function clearVSFTransaction(context, params, done) {
  context.dispatch('CLEAR_VSF');
  done();
};
