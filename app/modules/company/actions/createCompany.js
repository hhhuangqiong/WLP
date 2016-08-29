export default function (context, params, done) {
  const { token, ...companyProfile } = params;
  context.dispatch('CREATE_COMPANY_START');

  context.api.createProvision(companyProfile, (err, result) => {
    if (err) {
      context.dispatch('CREATE_COMPANY_FAILURE', err);
      done();
      return;
    }

    context.dispatch('CREATE_COMPANY_SUCCESS', token);
    done();
  });
}
