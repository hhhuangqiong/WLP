// N.B. Created for display error messages, can be used in any component
var debug = require('debug')('app:errorMessage');

export function errorMessage(context, params, done) {
  debug('Started');

  context.dispatch('ERROR_MESSAGE', params);
};
