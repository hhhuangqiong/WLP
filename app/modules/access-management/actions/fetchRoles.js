import Q from 'q';

import { FETCH_ROLES_SUCCESS } from './../constants/actionTypes';

const ROLES = [{
  id: '1',
  name: 'Administrator',
  permissions: {
    company: ['create', 'read', 'update', 'delete'],
    'wlp:generalOverview': ['read'],
  },
}, {
  id: '2',
  name: 'WL Developer',
  permissions: {
    company: ['read'],
  },
}];


export default function fetchRoles(context) {
  context.dispatch('FETCH_ROLES_START');
  return Q.timeout(500)
    .then(() => {
      context.dispatch(FETCH_ROLES_SUCCESS, ROLES);
    });
}
