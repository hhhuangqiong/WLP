import {
  CREATE_SIGNUP_RULES_START,
  CREATE_SIGNUP_RULES_SUCCESS,
  CREATE_SIGNUP_RULES_FAILURE,
} from '../constants/actionTypes';

export default function (context, payload, done) {
  const { apiClient } = context;
  const { carrierId, identities } = payload;

  context.dispatch(CREATE_SIGNUP_RULES_START);

  const endpoint = `carriers/${carrierId}/signupRules`;

  apiClient
    .post(endpoint, { data: { identities } })
    .then(result => {
      context.dispatch(CREATE_SIGNUP_RULES_SUCCESS, result);
      done();
    })
    .catch(err => {
      context.dispatch(CREATE_SIGNUP_RULES_FAILURE, err);
      done();
    });
}
