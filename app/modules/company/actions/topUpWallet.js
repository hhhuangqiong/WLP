import fetchCompanyWalletRecords from './fetchCompanyWalletRecords';

export default function (context, params) {
  const { apiClient } = context;
  const { carrierId, pageParams, ...data } = params;
  context.dispatch('TOP_UP_WALLET_START');

  const endPoint = `carriers/${carrierId}/topUpRecords`;

  return apiClient
  .post(endPoint, { data })
  .then(result => {
    context.dispatch('TOP_UP_WALLET_SUCCESS', {
      ...result,
      walletId: params.walletId,
      amount: params.amount.toString(),
      description: params.description,
    });
    // Refresh transactions table from API to ensure updates from other tabs / users are not lost
    context.executeAction(fetchCompanyWalletRecords, { ...pageParams, carrierId });
  })
  .catch(err => {
    context.dispatch('TOP_UP_WALLET_FAILURE', err);
  });
}
