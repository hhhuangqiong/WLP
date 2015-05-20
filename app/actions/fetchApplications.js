var debug = require('debug')('app:fetchApplications');

export default function(context, params, done) {
  debug('Started');
  context.dispatch('FETCH_COMPANY_APPLICATION_START');
  context.api.getCompanies(params, function(err, result) {
    if (err) {
      debug('Failed');
      context.dispatch('FETCH_COMPANY_APPLICATION_FAILURE', err);
      done();
      return;
    }

    debug('Success');
    context.dispatch('FETCH_COMPANY_APPLICATION_SUCCESS', params.carrierId, result);

    done();
  });
};
