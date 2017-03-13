import dispatchApiCall from '../../../utils/dispatchApiCall';

export default function (context, params) {
  const { carrierId, companyId } = params;
  const args = {
    context,
    eventPrefix: 'DELETE_COMPANY_LOGO',
    url: `/carriers/${carrierId}/company/${companyId}/logo`,
    method: 'delete',
  };
  dispatchApiCall(args);
}
