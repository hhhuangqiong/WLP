import { CALLS, IM } from '../constants/ExportType';

let debug = require('debug')('app:modules/file-export/actions/fetchExportProgress');

const WITHOUT_EXPORT_TYPE_LABEL = 'Please specific export type!';

export default function(context, params, done) {
  debug('Started');

  var exportType = params.exportType;

  function exportProgressCallback(err, result) {
    debug(params);

    result.exportId = params.exportId;
    result.exportType = exportType;

    if (err) {
      debug('Failed');
      err.exportType = exportType;
      context.dispatch('FETCH_EXPORT_PROGRESS_FAILURE', err);
      done();
      return;
    }

    debug('Success');

    context.dispatch('FETCH_EXPORT_PROGRESS_SUCCESS', result);
    done();
  };

  switch (exportType) {
    case CALLS:
      context.api.getCallsExportProgress(params, exportProgressCallback);
      break;

    case IM:
      context.api.getImExportProgress(params, exportProgressCallback);
      break;

    default:
      context.dispatch('FETCH_EXPORT_PROGRESS_FAILURE', { message: WITHOUT_EXPORT_TYPE_LABEL });
  }

};
