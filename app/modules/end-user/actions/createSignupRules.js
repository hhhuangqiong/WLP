import dispatchApiCall from '../../../utils/dispatchApiCall';

export default function (context, params) {
  const { carrierId, identities } = params;
  const args = {
    context,
    eventPrefix: 'CREATE_SIGNUP_RULES',
    url: `/carriers/${carrierId}/signupRules`,
    method: 'post',
    data: identities,
  };
  dispatchApiCall(args);
}
