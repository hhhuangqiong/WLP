import dispatchApiCall from '../../../utils/dispatchApiCall';

export default function (context, params) {
  const { carrierId, provisionId } = params;
  const args = {
    context,
    eventPrefix: 'FETCH_COMPANY_DETAIL',
    url: `/carriers/${carrierId}/provisioning/${provisionId}`,
    method: 'get',
  };
  dispatchApiCall(args);
}
