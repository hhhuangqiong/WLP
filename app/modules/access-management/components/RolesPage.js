import React, { Component, PropTypes } from 'react';
import { isString, isNumber, without, cloneDeep } from 'lodash';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { injectIntl } from 'react-intl';

import * as Panel from './../../../main/components/Panel';
import RolesTable from './RolesTable';

import addRole from './../actions/addRole';
import updateRole from '../actions/updateRole';
import removeRole from './../actions/removeRole';
import fetchRoles from './../actions/fetchRoles';

import { MESSAGES } from './../constants/i18n';
import RoleStore from './../stores/RoleStore';
import ApplicationStore from './../../../main/stores/ApplicationStore';

export class RolesPage extends Component {
  static get contextTypes() {
    return {
      executeAction: PropTypes.func.isRequired,
    };
  }
  static get propTypes() {
    return {
      roles: PropTypes.arrayOf(PropTypes.object),
      permissions: PropTypes.arrayOf(PropTypes.object),
      company: PropTypes.object.isRequired,
    };
  }
  constructor(props) {
    super(props);
    this.state = {
      displayedRoles: props.roles,
      editedRoleIndex: null,
      hoveredRoleIndex: null,
      editedRoleBackup: null,
    };
  }
  componentDidMount() {
    const query = {
      company: this.props.company.id,
    };
    this.context.executeAction(fetchRoles, query);
  }
  componentWillReceiveProps(nextProps) {
    this.state.displayedRoles = nextProps.roles;
    this.finishRoleEdit();
  }
  addRole() {
    const role = {
      name: null,
      company: this.props.company.id,
      permissions: {},
    };
    const roles = [...this.state.displayedRoles, role];
    this.setState({ displayedRoles: roles });
    this.startRoleEdit(roles.length - 1);
  }
  suggestRoleEdit(index) {
    if (this.state.hoveredRoleIndex === index) {
      return;
    }
    this.setState({ hoveredRoleIndex: index });
  }
  startRoleEdit(index) {
    if (this.state.editedRoleIndex === index) {
      return;
    }
    this.cancelRoleEdit();
    const editedRoleBackup = cloneDeep(this.state.displayedRoles[index]);
    this.setState({
      editedRoleIndex: index,
      editedRoleBackup,
    });
  }
  changeEditedRoleName(name) {
    const index = this.state.editedRoleIndex;
    if (!isNumber(index)) {
      return;
    }
    const roles = [...this.state.displayedRoles];
    roles[index] = { ...roles[index], name };
    this.setState({ displayedRoles: roles });
  }
  changeEditedRolePermission({ resource, action, operation }) {
    const index = this.state.editedRoleIndex;
    if (!isNumber(index)) {
      return;
    }
    const roles = [...this.state.displayedRoles];
    const role = roles[index];
    role.permissions = role.permissions || {};
    let actions = role.permissions[resource] || [];
    actions = operation === 'add'
      ? [...actions, action]
      : without(actions, action);
    roles[index].permissions[resource] = actions;
    this.setState({ displayedRoles: roles });
  }
  cancelRoleEdit() {
    const index = this.state.editedRoleIndex;
    if (!isNumber(index)) {
      return;
    }
    let roles = this.state.displayedRoles.slice(0);
    const role = roles[index];
    if (this.isNewRole(role)) {
      roles = without(roles, role);
    } else {
      roles = roles.slice(0);
      roles[index] = this.state.editedRoleBackup;
    }
    this.setState({
      displayedRoles: roles,
      editedRoleIndex: null,
      editedRoleBackup: null,
    });
  }
  isNewRole(role) {
    return !isString(role.id);
  }
  saveRole() {
    const role = this.state.displayedRoles[this.state.editedRoleIndex];
    const action = this.isNewRole(role) ? addRole : updateRole;
    this.context.executeAction(action, role);
  }
  removeRole() {
    const index = this.state.editedRoleIndex;
    if (!isNumber(index)) {
      return;
    }
    const role = this.state.displayedRoles[index];
    this.context.executeAction(removeRole, role);
  }
  finishRoleEdit() {
    this.setState({
      editedRoleIndex: null,
      editedRoleBackup: null,
    });
  }
  render() {
    const { intl } = this.props;
    return (
      <div>
        <Panel.Wrapper className="roles-panel">
          <Panel.Header title={intl.formatMessage(MESSAGES.rolesAndPermissions)}>
            <button className="button radius" onClick={() => this.addRole()}>
              {intl.formatMessage(MESSAGES.addNewRole)}
            </button>
          </Panel.Header>
          <Panel.Body className="roles-table-container">
            <RolesTable
              roles={this.state.displayedRoles}
              permissions={this.props.permissions}
              hoveredRoleIndex={this.state.hoveredRoleIndex}
              editedRoleIndex={this.state.editedRoleIndex}
              onRoleSaved={() => this.saveRole()}
              onRoleRemoved={() => this.removeRole()}
              onRoleEditSuggested={e => this.suggestRoleEdit(e.index)}
              onRoleEditStarted={e => this.startRoleEdit(e.index)}
              onRoleEditCancelled={() => this.cancelRoleEdit()}
              onRolePermissionChanged={e => this.changeEditedRolePermission(e)}
              onRoleNameChanged={e => this.changeEditedRoleName(e.name)}
            />
          </Panel.Body>
        </Panel.Wrapper>
      </div>
    );
  }
}

RolesPage = injectIntl(RolesPage);
RolesPage = connectToStores(
  RolesPage,
  [RoleStore, ApplicationStore],
  (context) => {
    const state = context.getStore(RoleStore).getState();
    state.company = context.getStore(ApplicationStore).getCurrentCompany();
    return state;
  }
);

export default RolesPage;
