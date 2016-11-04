import _ from 'lodash';
import createStore from 'fluxible/addons/createStore';
import { PERMISSIONS } from './../constants/permissions';

const RoleStore = createStore({
  storeName: 'RoleStore',
  handlers: {
    FETCH_ROLES_SUCCESS: 'handleRolesReceived',
    ADD_ROLE_SUCCESS: 'handleRoleAdded',
    UPDATE_ROLE_SUCCESS: 'handleRoleUpdated',
    REMOVE_ROLE_SUCCESS: 'handleRoleRemoved',
    GET_CARRIER_RESOURCES_SUCCESS: 'handleResourcesReceived',
  },
  initialize() {
    this.roles = [];
    this.carrierPermissions = [];
  },
  handleRoleUpdated(role) {
    const roles = this.roles.slice(0);
    const index = _.findIndex(roles, x => x.id === role.id);
    roles[index] = role;
    this.roles = roles;
    this.emitChange();
  },
  handleRoleAdded(role) {
    this.roles = [...this.roles, role];
    this.emitChange();
  },
  handleResourcesReceived(resources) {
    const carrierPermissions = _.map(PERMISSIONS, eachPermission => {
      if (!eachPermission.children) {
        return eachPermission;
      }
      return {
        ...eachPermission,
        children: _.filter(eachPermission.children, permissionChild =>
          _.includes(resources, permissionChild.resource)),
      };
    });
    this.carrierPermissions = _.filter(carrierPermissions, eachPermission => {
      if (!eachPermission.children) {
        return _.includes(resources, eachPermission.resource);
      }
      return eachPermission.children.length > 0;
    });
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
      carrierPermissions: this.carrierPermissions,
    };
  },
  dehydrate() {
    return this.getState();
  },
  rehydrate(state) {
    this.roles = state.roles;
    this.carrierPermissions = state.carrierPermissions;
  },
});

export default RoleStore;
