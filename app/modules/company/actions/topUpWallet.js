import fetchCompanyWalletRecords from './fetchCompanyWalletRecords';

export default function (context, params, done) {
  const { pageParams, ...form } = params;
  context.dispatch('TOP_UP_WALLET_START');

  context.api.createTopUpRecord(form, (err, result) => {
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
    // Refresh transactions table from API to ensure updates from other tabs / users are not lost
    context.executeAction(fetchCompanyWalletRecords, { ...pageParams, carrierId: params.carrierId });
    done();
  });
}
