var debug = require('debug')('wlp:showCompanyAction');

import CompanyStore from '../stores/CompanyStore';

/**
 * fetch company from companyStore
 *
 * @param context
 * @param payload
 * @param done
 */
function fetchCompany(context, payload, done) {
  // should we dispatch and pass carrierId to store directly rather than
  // get getCompany form store and then ask store to response to changes?
  let companyStore = context.getStore(CompanyStore);

  companyStore.getCompanyByCarrierId(payload.carrierId, function(company) {
    context.dispatch('RECEIVE_COMPANY', company);
    done();
  });
}

/**
 * fetch companies from fluxible fetchr registered services
 *
 * @param context {Object}
 * @param payload {Object}
 * @param done {Function}
 * @param cb {Function|null} chained function which depends on companies fetched
 */
function fetchCompanies(context, payload, done, cb) {
  debug('fetching companies');

  context.service.read('company', {}, {}, function (err, companies) {
    if (err) {
      //error handling
    }

    context.dispatch('RECEIVE_COMPANIES', companies);

    if (cb && cb instanceof Function) {
      cb(context, payload, done);
    } else {
      done();
    }
  });

}

module.exports = function (context, payload, done) {
  context.dispatch('SHOW_COMPANY_START');

  let companyStore = context.getStore(CompanyStore);

  // do we fetch companies every time?
  // users won't be able to see changes made by other users
  // if not, keep this
  const companiesExist = Object.keys(companyStore.getAll()).length > 0;

  // Four cases here:
  // 1. Going into Company page with existing Companies data, pick a company form the list
  // 2. Going into Company page without Companies data, fetch companies and then pick a company form that
  // 3. Going into Companies page with existing Companies data, return them
  // 4. Going into Companies page without Companies data, fetch it
  if (payload.carrierId) {
    if (companiesExist) {
      fetchCompany(context, payload, done);
    } else {
      fetchCompanies(context, payload, done, fetchCompany);
    }
  } else {
    fetchCompanies(context, payload, done);
  }
};
