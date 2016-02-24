import { CALLS, IM, END_USER } from '../constants/ExportType';

let debug = require('debug')('app:modules/file-export/actions/fetchExportProgress');

const WITHOUT_EXPORT_TYPE_LABEL = 'Please specific export type!';

export default function (context, params, done) {

  var exportType = params.exportType;

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
