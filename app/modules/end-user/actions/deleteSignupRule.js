import {
  DELETE_SIGNUP_RULE_START,
  DELETE_SIGNUP_RULE_SUCCESS,
  DELETE_SIGNUP_RULE_FAILURE,
} from '../constants/actionTypes';

export default function (context, payload, done) {
  const { apiClient } = context;
  const { carrierId, id } = payload;

  context.dispatch(DELETE_SIGNUP_RULE_START);

  const endpoint = `carriers/${carrierId}/signupRules/${id}`;

  apiClient
    .delete(endpoint)
    .then(() => {
      context.dispatch(DELETE_SIGNUP_RULE_SUCCESS, id);
      done();
    })
    .catch(err => {
      context.dispatch(DELETE_SIGNUP_RULE_FAILURE, err);
      done();
    });
}
