var debug = require('debug')('wlp:updateCompanyService');

export default function(context, params, done) {
  debug('Started');
  context.dispatch(`UPDATE_COMPANY_SERVICE_START`);
  context.api.updateCompanyService(params, function(err, result) {
    if (err) {
      debug('Failed');
      context.dispatch(`UPDATE_COMPANY_SERVICE_FAILURE`, err);
      done();
      return;
    }

    debug('Success');
    context.dispatch(`UPDATE_COMPANY_SERVICE_SUCCESS`, result.company);
    done();
  });
};
