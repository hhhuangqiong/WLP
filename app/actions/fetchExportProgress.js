var debug = require('debug')('wlp:fetchExportProgress');

export default function(context, params, done) {
  debug('Started');

  context.dispatch('FETCH_EXPORT_PROGRESS_START');

  context.api.getCallsExportProgress(params, function(err, result) {
    debug(params);
    context.dispatch('FETCH_EXPORT_PROGRESS_END');
    if (err) {
      debug('Failed');
      context.dispatch('FETCH_EXPORT_PROGRESS_FAILURE', err);
      done();
      return;
    }

    debug('Success');
    context.dispatch('FETCH_EXPORT_PROGRESS_SUCCESS', result);
    done();
  });

};
