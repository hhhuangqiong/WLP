var debug = require('debug')('wlp:fetchCompanies');

export default function(context, params, done) {
  debug('Started');
  context.dispatch('FETCH_COMPANIES_START');
  context.api.getCompanies(params, function(err, result) {
    if (err) {
      debug('Failed');
      context.dispatch('FETCH_COMPANIES_FAILURE', err);
      done();
      return;
    }

    debug('Success');
    context.dispatch('FETCH_COMPANIES_SUCCESS', result.companies);
    if (params.carrierId) {
      context.dispatch('FETCH_COMPANY_SUCCESS', result.companies[params.carrierId]);
    }

    done();
  });
};
