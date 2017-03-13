import dispatchApiCall from '../../../utils/dispatchApiCall';

export default function (context, params) {
  const { carrierId, ...data } = params;
  const args = {
    context,
    eventPrefix: 'ADD_ROLE',
    url: `/carriers/${carrierId}/roles`,
    method: 'post',
    data,
  };
  dispatchApiCall(args);
}
