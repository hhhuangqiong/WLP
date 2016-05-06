const debug = require('debug')('app:actions/getAccessibleCompanies');

export default function getAccessibleCompanies(context, params, done) {
  debug('action start');

  const { apiClient } = context;

  context.dispatch('FETCH_MANAGING_COMPANIES_START');

  apiClient
    .get('accessibleCompanies')
    .then(result => {
      context.dispatch('FETCH_MANGAING_COMPANIES_SUCCESS', result.data);
      done();
    })
    .catch(err => {
      context.dispatch('FETCH_MANAGING_COMPANIES_FAILURE', err);
      done();
    });
}
