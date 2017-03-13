import dispatchApiCall from '../../../utils/dispatchApiCall';

export default function (context, params) {
  const args = {
    context,
    eventPrefix: 'FETCH_CARRIER_MANAGING_COMPANIES',
    url: `/carriers/${params.carrierId}/managingCompaniesRoles`,
    method: 'get',
  };
  dispatchApiCall(args);
}
