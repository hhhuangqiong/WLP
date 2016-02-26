export default function (context, params, done) {
  context.dispatch('FETCH_EXPORT_CANCEL_START');

  function exportCallback(err, result) {
    if (err) {
      context.dispatch('FETCH_EXPORT_CANCEL_FAILURE', err);
      done();
      return;
    }

    context.dispatch('FETCH_EXPORT_CANCEL_SUCCESS', result);
    done();
  }

  context.api.cancelExport(params, exportCallback);
}
