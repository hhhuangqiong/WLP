import createDebug from 'debug';
import Q from 'q';
import _ from 'lodash';

const debug = createDebug('app:actions/getAccessibleCompanies');

export default function getAccessibleCompanies(context, payload) {
  const { apiClient } = context;
  const { carrierId } = payload;

  if (!carrierId) {
    context.dispatch('FETCH_MANAGING_COMPANIES_FAILURE', null);
    return Q.resolve(null);
  }

  debug('Loading current managingCompanies company info for user');
  return apiClient
    .get(`/carriers/${carrierId}/me/companies`)
    .then(companies => {
      debug('Loaded managingCompanies company successfully.');
      context.dispatch('FETCH_MANGAING_COMPANIES_SUCCESS', companies);
      // if the carrierId is one of the managing companies, it will obtain the data directly
      const targetCompany = _.find(companies, comp => comp.carrierId === carrierId);
      if (!targetCompany) {
        debug('Fail to load current company.');
        context.dispatch('FETCH_COMPANY_INFO_FAILURE', null);
        return companies;
      }
      debug(`Loaded current company successfully: ${targetCompany.name}.`);
      context.dispatch('FETCH_COMPANY_INFO_SUCCESS', targetCompany);
      return companies;
    })
    .catch(err => {
      debug(`Error while loading current company: ${err.message}.`);
      context.dispatch('FETCH_MANAGING_COMPANIES_FAILURE', err);
    });
}
