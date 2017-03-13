import dispatchApiCall from '../../../utils/dispatchApiCall';

export default function (context, params) {
  const { carrierId } = params;
  const args = {
    context,
    eventPrefix: 'FETCH_ROLES',
    url: `/carriers/${carrierId}/roles`,
    method: 'get',
  };
  dispatchApiCall(args);
}
