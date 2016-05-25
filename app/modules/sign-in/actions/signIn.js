import { TimeoutError } from 'common-errors';
import {
  CHANGE_USERNAME,
  CHANGE_PASSWORD,
  SIGN_IN_START,
  SIGN_IN_FAILURE,
} from '../constants/actionTypes';
import { ERROR_MESSAGE } from '../../../main/system-message/constants/actionTypes';
import { MESSAGES } from '../../../main/system-message/constants/messages';

const debug = require('debug')('app:main/actions/signIn');

export function changePassword(context, payload) {
  const { password } = payload;
  context.dispatch(CHANGE_PASSWORD, password);
}

export function changeUsername(context, payload) {
  const { username } = payload;
  context.dispatch(CHANGE_USERNAME, username);
}

export function signIn(context, payload, done) {
  const { apiClient } = context;
  const { username, password } = payload;

  context.dispatch(SIGN_IN_START);

  apiClient
    .post('sign-in', {
      data: {
        username,
        password,
      },
    })
    .then(result => {
      const { status, errors } = result;

      // not confirmed how to handle
      // error localisation properly yet
      if (errors) {
        let error;

        switch (status) {
          case '400':
            error = MESSAGES.signInBadRequest;
            break;

          default:
            error = MESSAGES.signInGeneral;
        }

        context.dispatch(SIGN_IN_FAILURE, error);
        context.dispatch(ERROR_MESSAGE, error);
        done();
        return;
      }

      // we need not to update the store
      // just redirect the user back to the server
      // and the session will be reconstructed at server
      try {
        window.location.assign('/');
      } catch (error) {
        throw error;
      }

      done();
    })
    .catch(err => {
      debug('error occurred when signing in', err);

      let error = MESSAGES.signInInternalServerError;

      if (err instanceof TimeoutError) {
        error = MESSAGES.signInTimeout;
      }

      context.dispatch(SIGN_IN_FAILURE, error);
      context.dispatch(ERROR_MESSAGE, error);

      done();
    });
}
