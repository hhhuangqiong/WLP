var debug = require('debug')('wlp:createCompany');

export default function(context, params, done) {
  debug('Started');
  context.dispatch('CREATE_COMPANY_START');
  context.api.createCompany(params, function(err, result) {
    if (err) {
      debug('Failed');
      context.dispatch('CREATE_COMPANY_FAILURE', err);
      done();
      return;
    }

    debug('Success');
    context.dispatch('CREATE_COMPANY_SUCCESS', result.company);
    done();
  });
};
