var debug = require('debug')('wlp:updateCompanyProfile');

export default function(context, params, done) {
  debug('Started');
  context.dispatch(`UPDATE_COMPANY_PROFILE_START`);
  context.api.updateCompanyProfile(params, function(err, result) {
    if (err) {
      debug('Failed');
      context.dispatch(`UPDATE_COMPANY_PROFILE_FAILURE`, err);
      done();
      return;
    }

    debug('Success');
    context.dispatch(`UPDATE_COMPANY_PROFILE_SUCCESS`, result.company);
    done();
  });
};
