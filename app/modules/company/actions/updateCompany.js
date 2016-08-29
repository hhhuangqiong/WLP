export default function (context, params, done) {
  const { token, ...companyProfile } = params;
  context.dispatch('UPDATE_COMPANY_START');

  context.api.updateProvision(companyProfile, (err, result) => {
    if (err) {
      context.dispatch('UPDATE_COMPANY_FAILURE', err);
      done();
      return;
    }

    context.dispatch('UPDATE_COMPANY_SUCCESS', token);
    done();
  });
}
