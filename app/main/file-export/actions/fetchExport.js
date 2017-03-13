const debug = require('debug')('app:modules/file-export/actions/fetchExport');

export default function (context, params) {
  debug('Started');

  const { apiClient } = context;
  const { exportType, carrierId } = params;
  context.dispatch('FETCH_EXPORT_START');

  return apiClient.get(`/carriers/${carrierId}`, { query: params }, '/export')
        .then(result => {
          // result will be null if the request is blocked by API
          if (result) {
            debug('Success');
            const exportResult = { ...result, exportType };
            context.dispatch('FETCH_EXPORT_SUCCESS', exportResult);
          }
        }).catch(err => {
          debug('Failed');
          const exportErr = { ...err, exportType };
          context.dispatch('FETCH_EXPORT_FAILURE', exportErr);
        });
}
