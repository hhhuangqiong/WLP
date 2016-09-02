export default function (context, params) {
  const { token, ...companyProfile } = params;
  context.dispatch('UPDATE_COMPANY_PROFILE_START');

  context.api.updateCompanyProfile(companyProfile, err => {
    if (err) {
      context.dispatch('UPDATE_COMPANY_PROFILE_FAILURE', err);
      return;
    }

    context.dispatch('UPDATE_COMPANY_PROFILE_SUCCESS', token);
  });
}
