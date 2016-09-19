export default function (context, params, done) {
  const { apiClient } = context;
  context.dispatch('FETCH_CARRIER_MANAGING_COMPANIES');
  apiClient
    .get(`companies/${params.companyId}/managingCompanies`)
    .then(result => {
      context.dispatch('FETCH_CARRIER_MANAGING_COMPANIES_SUCCESS', result);
      done();
    })
    .catch(err => {
      context.dispatch('FETCH_CARRIER_MANAGING_COMPANIES_SUCCESS', err);
      done();
    });
}
