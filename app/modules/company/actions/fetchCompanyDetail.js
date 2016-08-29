export default function (context, params, done) {
  context.dispatch('FETCH_COMPANY_DERAIL_START');

  context.api.getProvision(params, (err, result) => {
    if (err) {
      context.dispatch('FETCH_COMPANY_DETAIL_FAILURE', err);
      done();
      return;
    }

    context.dispatch('FETCH_COMPANY_DETAIL_SUCCESS', result);
    done();
  });
}
