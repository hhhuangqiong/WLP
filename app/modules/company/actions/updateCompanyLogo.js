import dispatchApiCall from '../../../utils/dispatchApiCall';

export default function (context, params) {
  const { carrierId, companyId, logoFile } = params;
  const formData = new FormData();
  if (logoFile) {
    formData.append('logo', logoFile);
  }
  const args = {
    context,
    eventPrefix: 'UPDATE_COMPANY_LOGO',
    url: `/carriers/${carrierId}/company/${companyId}/logo`,
    method: 'put',
    data: formData,
  };
  dispatchApiCall(args);
}
