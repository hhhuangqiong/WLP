export default function (context, params) {
  const { apiClient } = context;
  return apiClient
    .get(`/carriers/${params.carrierId}/managingCompaniesRoles`)
    .then(result => {
      context.dispatch('FETCH_CARRIER_MANAGING_COMPANIES_SUCCESS', result);
    }).catch(err => {
      context.dispatch('FETCH_CARRIER_MANAGING_COMPANIES_FAILURE', err);
    });
}
