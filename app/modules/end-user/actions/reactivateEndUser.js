import dispatchApiCall from '../../../utils/dispatchApiCall';

export default function (context, payload) {
  const { carrierId, username } = payload;
  const args = {
    context,
    eventPrefix: 'DEACTIVATE_END_USER',
    url: `carriers/${carrierId}/users/${username}/suspension`,
    method: 'delete',
  };
  dispatchApiCall(args);
}
