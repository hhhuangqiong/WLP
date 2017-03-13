import dispatchApiCall from '../../../utils/dispatchApiCall';

export default function (context, params) {
  const { carrierId } = params;
  const args = {
    context,
    eventPrefix: 'GET_CARRIER_RESOURCES',
    url: `/carriers/${carrierId}/resource`,
    method: 'get',
  };
  dispatchApiCall(args);
}
