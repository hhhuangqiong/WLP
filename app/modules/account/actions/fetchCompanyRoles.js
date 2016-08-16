export default function (context, params, done) {
  const { apiClient } = context;
  context.dispatch('FETCH_COMPANY_ROLES__START');
  apiClient
    .get(`companies/${params.companyId}/roles`)
    .then(roles => {
      context.dispatch('FETCH_COMPANY_ROLES_SUCCESS', roles);
      done();
    })
    .catch(err => {
      context.dispatch('FETCH_COMPANY_ROLES_FAILURE', err);
      done();
    });
}
