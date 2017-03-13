import fetchCompanyWalletRecords from './fetchCompanyWalletRecords';
import dispatchApiCall from '../../../utils/dispatchApiCall';

export default async function (context, params) {
  const { carrierId, pageNumber, pageSize } = params;

  const args = {
    context,
    eventPrefix: 'FETCH_COMPANY_WALLETS',
    url: `/carriers/${carrierId}/wallets`,
    method: 'get',
  };
  const wallets = await dispatchApiCall(args);

  if (wallets.length !== 0) {
    context.executeAction(fetchCompanyWalletRecords, { carrierId, pageNumber, pageSize });
  }
}
