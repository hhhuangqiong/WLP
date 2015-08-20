let debug = require('debug')('app:actions/fetchManagingCompanies');

export default function(context, params, done) {
  debug('Started');
  context.dispatch('FETCH_MANAGING_COMPANIES_START');

  context.api.getManagingCompanies(params, function(err, result) {
    if (err) {
      debug('Failed');
      context.dispatch('FETCH_MANAGING_COMPANIES_FAILURE', err);
      done();
      return;
    }

    debug('Success');
    context.dispatch('FETCH_MANGAING_COMPANIES_SUCCESS', result.companies);
    done();
  });
}
