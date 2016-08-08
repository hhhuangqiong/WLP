import Q from 'q';

import { REMOVE_ROLE_SUCCESS } from './../constants/actionTypes';

export default function removeRole(context, payload) {
  context.dispatch('REMOVE_ROLE_START');
  return Q.timeout(500)
    .then(() => {
      context.dispatch(REMOVE_ROLE_SUCCESS, payload);
    });
}
