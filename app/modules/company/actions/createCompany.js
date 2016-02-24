export default function (context, params, done) {
  context.dispatch('CREATE_COMPANY_START');
  context.api.createCompany(params, function (err, result) {
    if (err) {
      debug('Failed');
      context.dispatch('CREATE_COMPANY_FAILURE', err);
      done();
      return;
    }

    context.dispatch('CREATE_COMPANY_SUCCESS', result.company);

    const { role, identity } = context.getRouter().getCurrentParams();
    context.getRouter().transitionTo('company-profile', { role: role, identity: identity, carrierId: result.company.carrierId });
    done();
  });
}
