import dispatchApiCall from '../../../utils/dispatchApiCall';

export default function (context, params) {
  const { carrierId, query } = params;
  const args = {
    context,
    eventPrefix: 'FETCH_SIGNUP_RULES',
    url: `/carriers/${carrierId}/signupRules`,
    method: 'get',
    query,
  };
  dispatchApiCall(args);
}
