import dispatchApiCall from '../../../utils/dispatchApiCall';

export default function (context, params) {
  const { carrierId, username } = params;
  const args = {
    context,
    eventPrefix: 'FETCH_END_USERS',
    url: `/carriers/${carrierId}/users/${username}`,
    method: 'get',
  };
  dispatchApiCall(args);
}
