export default function (context, params) {
  const { apiClient } = context;
  const { exportId, carrierId, exportType } = params;
  
  return apiClient.get(`/carriers/${carrierId}/progress`, { query: params }, '/export')
        .then(result => {
          const res = { ...result, exportId, exportType };
          context.dispatch('FETCH_EXPORT_PROGRESS_SUCCESS', res);
        }).catch(err => {
          const error = { ...err, exportType };
          context.dispatch('FETCH_EXPORT_PROGRESS_FAILURE', error);
        });
}
