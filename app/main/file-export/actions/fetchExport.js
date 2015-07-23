import { CALLS, IM } from '../constants/ExportType';

let debug = require('debug')('app:modules/file-export/actions/fetchExport');

const WITHOUT_EXPORT_TYPE_LABEL = 'Please specific export type!';

export default function(context, params, done) {
  debug('Started');

  context.dispatch('FETCH_EXPORT_START');

  var exportType = params.exportType;

  function exportCallback(err, result) {
    result.exportType = exportType;

    if (err) {
      debug('Failed');
      err.exportType = exportType;
      context.dispatch('FETCH_EXPORT_FAILURE', err);
      done();
      return;
    }

    debug('Success');
    context.dispatch('FETCH_EXPORT_SUCCESS', result);
    done();
  };

  switch (exportType) {
    case CALLS:
      context.api.getCallsExport(params, exportCallback);
      break;

    case IM:
      context.api.getImExport(params, exportCallback);
      break;

    default:
      context.dispatch('FETCH_EXPORT_FAILURE', { message: WITHOUT_EXPORT_TYPE_LABEL });
  }

};
