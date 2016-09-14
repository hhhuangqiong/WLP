export default function (context, params, done) {
  context.dispatch('TOP_UP_WALLET_START');

  context.api.createTopUpRecord(params, (err, result) => {
    if (err) {
      context.dispatch('TOP_UP_WALLET_FAILURE', err);
      done();
      return;
    }
    context.dispatch('TOP_UP_WALLET_SUCCESS', {
      ...result,
      walletId: params.walletId,
      amount: params.amount.toString(),
      description: params.description,
    });
    done();
  });
}
