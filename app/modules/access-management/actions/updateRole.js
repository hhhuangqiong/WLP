import Q from 'q';
import { clone } from 'lodash';

import { UPDATE_ROLE_SUCCESS } from './../constants/actionTypes';

export default function updateRole(context, payload) {
  context.dispatch('UPDATE_ROLE_START');
  return Q.timeout(500)
    .then(() => {
      context.dispatch(UPDATE_ROLE_SUCCESS, clone(payload));
    });
}
