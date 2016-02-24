export default function (context, params, done) {
  context.api.getVSFTransactions(params, (err, result) => {
    if (err) {
      context.dispatch('FETCH_VSF_FAILURE', err);
      done();
      return;
    }

    context.dispatch('FETCH_VSF_SUCCESS', result);
    done();
  });
}
