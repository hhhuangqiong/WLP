import dispatchApiCall from '../../../utils/dispatchApiCall';

export default function (context, payload) {
  const { carrierId, username } = payload;
  const args = {
    context,
    eventPrefix: 'FETCH_END_USER_WALLET',
    url: `carriers/${carrierId}/users/${username}/wallet`,
    method: 'get',
  };
  dispatchApiCall(args);
}
