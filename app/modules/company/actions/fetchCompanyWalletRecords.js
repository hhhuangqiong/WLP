import dispatchApiCall from '../../../utils/dispatchApiCall';

export default function (context, params) {
  const { carrierId, ...query } = params;
  const args = {
    context,
    eventPrefix: 'FETCH_COMPANY_WALLET_RECORDS',
    url: `/carriers/${carrierId}/topUpRecords`,
    method: 'get',
    query,
  };
  dispatchApiCall(args);
}
