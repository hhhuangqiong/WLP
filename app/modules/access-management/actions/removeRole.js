import dispatchApiCall from '../../../utils/dispatchApiCall';

export default function (context, params) {
  const { carrierId, id } = params;
  const args = {
    context,
    eventPrefix: 'REMOVE_ROLE',
    url: `/carriers/${carrierId}/roles/${id}`,
    method: 'delete',
  };
  dispatchApiCall(args);
}
