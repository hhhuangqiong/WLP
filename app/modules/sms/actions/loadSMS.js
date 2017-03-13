import dispatchApiCall from '../../../utils/dispatchApiCall';

export default function (context, params) {
  const { carrierId } = params;
  const args = {
    context,
    eventPrefix: 'FETCH_SMS',
    url: `/carriers/${carrierId}/sms`,
    method: 'get',
    query: params,
  };
  dispatchApiCall(args);
}
