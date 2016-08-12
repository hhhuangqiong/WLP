import Q from 'q';
import { extend, uniqueId } from 'lodash';
import { ADD_ROLE_SUCCESS } from './../constants/actionTypes';

export default function addRole(context, payload) {
  context.dispatch('ADD_ROLE_START');
  return Q.timeout(500)
    .then(() => {
      context.dispatch(ADD_ROLE_SUCCESS, extend({}, payload, { id: `temp-${uniqueId()}` }));
    });
}
