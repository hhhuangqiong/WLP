var debug = require('debug')('app:actions/performClearExport');

export default function(context) {
  context.dispatch('PERFORM_CLEAR_EXPORT_STATE');
};
