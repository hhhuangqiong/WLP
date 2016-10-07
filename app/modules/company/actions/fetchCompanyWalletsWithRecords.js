import Q from 'q';
import actionCreator from '../../../main/utils/apiActionCreator';
import fetchCompanyWalletRecords from './fetchCompanyWalletRecords';

const fetchWallets = actionCreator('FETCH_COMPANY_WALLETS', 'getWallets');

export default function fetchCompanyWalletsAndRecords(context, params) {
  const { carrierId, pageNumber, pageSize } = params;
  return context.executeAction(fetchWallets, { carrierId })
    .then(wallets => {
      if (wallets.length === 0) {
        return Q.resolve();
      }
      return context.executeAction(fetchCompanyWalletRecords, { carrierId, pageNumber, pageSize });
    });
}
