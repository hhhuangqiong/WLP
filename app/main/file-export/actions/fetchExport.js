const debug = require('debug')('app:modules/file-export/actions/fetchExport');

export default function (context, params, done) {
  debug('Started');

  context.dispatch('FETCH_EXPORT_START');
  const { exportType } = params;

  function exportCallback(err, result) {
    if (err) {
      debug('Failed');
      const exportErr = err;
      exportErr.exportType = exportType;
      context.dispatch('FETCH_EXPORT_FAILURE', exportErr);
      done();
      return;
    }

    // result will be null if the request is blocked by API
    if (result) {
      debug('Success');
      const exportResult = result;
      exportResult.exportType = exportType;
      context.dispatch('FETCH_EXPORT_SUCCESS', exportResult);
      done();
    }
  }

  context.api.getExport(params, exportCallback);
}
