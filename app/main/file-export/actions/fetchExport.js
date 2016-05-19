const debug = require('debug')('app:modules/file-export/actions/fetchExport');

export default function (context, params, done) {
  debug('Started');

  context.dispatch('FETCH_EXPORT_START');
  const { exportType } = params;

  function exportCallback(err, result) {

    if (err) {
      debug('Failed');
      err.exportType = exportType;
      context.dispatch('FETCH_EXPORT_FAILURE', err);
      done();
      return;
    }

    debug('Success');
    result.exportType = exportType;
    context.dispatch('FETCH_EXPORT_SUCCESS', result);
    done();
  }

  context.api.getExport(params, exportCallback);
}
