var debug = require('debug')('wlp:updateCompany');

export default function(context, params, done) {
  debug('Started');
  context.dispatch(`UPDATE_COMPANY_${params.subPage.toUpperCase()}_START`);
  context.api.updateCompany(params, function(err, result) {
    if (err) {
      debug('Failed');
      context.dispatch(`CREATE_COMPANY_${params.subPage.toUpperCase()}_FAILURE`, err);
      done();
      return;
    }

    debug('Success');
    context.dispatch(`CREATE_COMPANY_${params.subPage.toUpperCase()}_SUCCESS`, result.company);
    done();
  });
};
