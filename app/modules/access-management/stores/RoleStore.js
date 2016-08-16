import { findIndex } from 'lodash';
import createStore from 'fluxible/addons/createStore';
import { PERMISSIONS } from './../constants/permissions';


const RoleStore = createStore({
  storeName: 'RoleStore',
  handlers: {
    FETCH_ROLES_SUCCESS: 'handleRolesReceived',
    ADD_ROLE_SUCCESS: 'handleRoleAdded',
    UPDATE_ROLE_SUCCESS: 'handleRoleUpdated',
    REMOVE_ROLE_SUCCESS: 'handleRoleRemoved',
  },
  initialize() {
    this.roles = [];
    this.permissions = PERMISSIONS;
  },
  handleRoleUpdated(role) {
    const roles = this.roles.slice(0);
    const index = findIndex(roles, x => x.id === role.id);
    roles[index] = role;
    this.roles = roles;
    this.emitChange();
  },
  handleRoleAdded(role) {
    this.roles = [...this.roles, role];
    this.emitChange();
  },
  handleRoleRemoved(role) {
    this.roles = this.roles.filter(x => x.id !== role.id);
    this.emitChange();
  },
  handleRolesReceived(roles) {
    this.roles = roles;
    this.emitChange();
  },
  getState() {
    return {
      roles: this.roles,
      permissions: this.permissions,
    };
  },
});

export default RoleStore;
