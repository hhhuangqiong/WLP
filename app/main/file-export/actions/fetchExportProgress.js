export default function (context, params, done) {
  const exportType = params.exportType;

  function exportProgressCallback(err, result) {
    if (err) {
      err.exportType = exportType;
      context.dispatch('FETCH_EXPORT_PROGRESS_FAILURE', err);
      done();
      return;
    }

    result.exportId = params.exportId;
    result.exportType = exportType;
    context.dispatch('FETCH_EXPORT_PROGRESS_SUCCESS', result);
    done();
  }

  context.api.getExportProgress(params, exportProgressCallback);
}
