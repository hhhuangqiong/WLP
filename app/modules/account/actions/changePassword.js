import { ERROR_MESSAGE } from '../../../main/constants/actionTypes';
import { userPath } from '../../../server/paths';

const debug = require('debug')('app:createPassword');

export default function(context, params, done) {
  context.dispatch('CHANGE_PASSWORD_START');

  context.api.changePassword(params, (err, { error, result }) => {
    if (error) {
      context.dispatch('CHANGE_PASSWORD_FAILURE', error);
      done();
      return;
    }

    context.dispatch('CHANGE_PASSWORD_SUCCESS', result);
    done();
  });
}
