var debug = require('debug')('wlp:fetchCompanyService');

export default function(context, params, done) {
  debug('Started');
  context.dispatch('FETCH_COMPANY_SERVICE_START');
  context.api.getCompanyService(params, function(err, result) {
    if (err) {
      debug('Failed');
      context.dispatch('FETCH_COMPANY_SERVICE_FAILURE', err);
      done();
      return;
    }

    debug('Success');
    context.dispatch('FETCH_COMPANY_SERVICE_SUCCESS', { carrierId: params.carrierId, result: result });

    done();
  });
};
