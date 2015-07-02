var debug = require('debug')('wlp:fetchExportFile');

export default function(context, params, done) {
  debug('Started');

  context.dispatch('FETCH_EXPORT_FILE_START');

  context.api.getCallsExportFile(params, function(err, result) {
    debug(params);
    context.dispatch('FETCH_EXPORT_FILE_END');
    if (err) {
      debug('Failed');
      context.dispatch('FETCH_EXPORT_FILE_FAILURE', err);
      done();
      return;
    }

    debug('Success');
    context.dispatch('FETCH_EXPORT_FILE_SUCCESS', result);
    done();
  });

};
