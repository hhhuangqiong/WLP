import dispatchApiCall from '../../../utils/dispatchApiCall';

export default function (context, params) {
  const { token, carrierId, logo, ...provisionInfo } = params;
  const formData = new FormData();
  if (logo) {
    formData.append('logo', logo);
  }
  formData.append('data', JSON.stringify(provisionInfo));
  const args = {
    context,
    eventPrefix: 'CREATE_COMPANY',
    url: `/carriers/${carrierId}/provisioning`,
    method: 'post',
    data: formData,
    token,
  };
  dispatchApiCall(args);
}
