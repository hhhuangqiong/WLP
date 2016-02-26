export default function (context, params, done) {
  context.dispatch('FETCH_MANAGING_COMPANIES_START');

  context.api.getManagingCompanies(params, (err, result) => {
    if (err) {
      context.dispatch('FETCH_MANAGING_COMPANIES_FAILURE', err);
      done();
      return;
    }

    context.dispatch('FETCH_MANGAING_COMPANIES_SUCCESS', result.companies);
    done();
  });
}
