export default function (context, params, done) {
  context.dispatch('CREATE_COMPANY_START');

  context.api.createProvision(params, (err, result) => {
    if (err) {
      context.dispatch('CREATE_COMPANY_FAILURE', err);
      done();
      return;
    }

    context.dispatch('CREATE_COMPANY_SUCCESS', result);
    context.dispatch('CREATE_COMPANY_TOKEN', params.token);
    done();
  });
}
