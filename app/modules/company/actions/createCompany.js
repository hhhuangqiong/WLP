var debug = require('debug')('app:createCompany');

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

    let { role, identity } = context.getRouter().getCurrentParams();
    context.getRouter().transitionTo('company-profile', { role: role, identity: identity, carrierId: result.company.carrierId });
    done();
  });
}
