import {
  FETCH_SIGNUP_RULES_START,
  FETCH_SIGNUP_RULES_SUCCESS,
  FETCH_SIGNUP_RULES_FAILURE,
} from '../constants/actionTypes';

export default function (context, payload, done) {
  const { apiClient } = context;
  const { carrierId, query } = payload;

  context.dispatch(FETCH_SIGNUP_RULES_START);

  const endpoint = `carriers/${carrierId}/signupRules`;

  apiClient
    .get(endpoint, { query })
    .then(result => {
      context.dispatch(FETCH_SIGNUP_RULES_SUCCESS, result);
      done();
    })
    .catch(err => {
      context.dispatch(FETCH_SIGNUP_RULES_FAILURE, err);
      done();
    });
}
