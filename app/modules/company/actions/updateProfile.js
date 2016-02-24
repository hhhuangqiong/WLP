export default function (context, params) {
  context.dispatch('UPDATE_COMPANY_PROFILE_START');

  context.api.updateCompanyProfile(params, function (err, result) {
    if (err) {
      debug('Failed');
      context.dispatch('UPDATE_COMPANY_PROFILE_FAILURE', err);
      return;
    }

    debug('Success');
    context.dispatch('UPDATE_COMPANY_PROFILE_SUCCESS', result);

    // if carrierId is changed
    // change the current Url to new carrierId
    if (result.carrierId !== result.company.carrierId) {
      const router = context.getRouter();
      const params = router.getCurrentParams();
      const query = router.getCurrentQuery();

      // using replaceWith to not add an entry into the browser history
      router.replaceWith('company-profile', _.merge(params, { carrierId: result.company.carrierId }), query);
    }
  });
}
