export default function (context, params, done) {
  const { token, ...companyProfile } = params;
  context.dispatch('UPDATE_COMPANY_START');

  context.api.updateProvision(companyProfile, (err) => {
    if (err) {
      context.dispatch('UPDATE_COMPANY_FAILURE', err);
      context.dispatch('ERROR_MESSAGE', err);
      done();
      return;
    }

    context.dispatch('UPDATE_COMPANY_SUCCESS', token);
    done();
  });
}
