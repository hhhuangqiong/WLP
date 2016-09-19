import React, { Component, PropTypes } from 'react';
import { isString, isNumber, without, cloneDeep } from 'lodash';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { injectIntl, intlShape } from 'react-intl';

import * as Panel from './../../../main/components/Panel';
import RolesTable from './RolesTable';

import addRole from './../actions/addRole';
import updateRole from '../actions/updateRole';
import removeRole from './../actions/removeRole';
import fetchRoles from './../actions/fetchRoles';
import _ from 'lodash';
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
      intl: intlShape.isRequired,
      roles: PropTypes.arrayOf(PropTypes.object),
      permissions: PropTypes.arrayOf(PropTypes.object),
      company: PropTypes.object.isRequired,
    };
  }
  constructor(props) {
    super(props);
    this.state = {
      deleteDialogOpened: false,
      displayedRoles: props.roles,
      editedRoleIndex: null,
      hoveredRoleIndex: null,
      editedRoleBackup: null,
      adminRoleIndex: null,
    };
    this.saveRole = this.saveRole.bind(this);
    this.removeRole = this.removeRole.bind(this);
    this.changeEditedRoleName = this.changeEditedRoleName.bind(this);
    this.changeEditedRolePermission = this.changeEditedRolePermission.bind(this);
    this.handleOpenDeleteDialog = this.handleOpenDeleteDialog.bind(this);
    this.handleCloseDeleteDialog = this.handleCloseDeleteDialog.bind(this);
    this.cancelRoleEdit = this.cancelRoleEdit.bind(this);
    this.startRoleEdit = this.startRoleEdit.bind(this);
    this.suggestRoleEdit = this.suggestRoleEdit.bind(this);
    this.addRole = this.addRole.bind(this);
  }
  componentDidMount() {
    const query = {
      company: this.props.company.id,
    };
    this.context.executeAction(fetchRoles, query);
  }
  componentWillReceiveProps(nextProps) {
    this.state.displayedRoles = nextProps.roles;
    this.state.adminRoleIndex = _.findIndex(this.state.displayedRoles, { isRoot: true });
    this.finishRoleEdit();
  }
  addRole() {
    const role = {
      name: null,
      company: this.props.company.id,
      permissions: {},
      creating: true,
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
    const editedRoleBackup = cloneDeep(this.state.displayedRoles[index]);
    if (index !== this.state.adminRoleIndex) {
      this.setState({
        editedRoleIndex: index,
        editedRoleBackup,
      });
    }
  }
  changeEditedRoleName({ name }) {
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
    this.context.executeAction(action, _.omit(role, ['creating']));
  }
  removeRole() {
    const index = this.state.editedRoleIndex;
    if (!isNumber(index)) {
      return;
    }
    const role = this.state.displayedRoles[index];
    if (_.find(this.props.roles, mRole => role.id === mRole.id)) {
      this.context.executeAction(removeRole, role);
    }
    this.handleCloseDeleteDialog();
  }

  handleOpenDeleteDialog() {
    this.setState({
      deleteDialogOpened: true,
    });
  }

  handleCloseDeleteDialog() {
    this.setState({ deleteDialogOpened: false });
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
            <button className="button radius" onClick={this.addRole}>
              {intl.formatMessage(MESSAGES.addNewRole)}
            </button>
          </Panel.Header>
          <Panel.Body className="roles-table-container">
            <RolesTable
              roles={this.state.displayedRoles}
              adminRoleIndex={this.state.adminRoleIndex}
              permissions={this.props.permissions}
              hoveredRoleIndex={this.state.hoveredRoleIndex}
              editedRoleIndex={this.state.editedRoleIndex}
              deleteDialogOpened={this.state.deleteDialogOpened}
              onRoleSaved={this.saveRole}
              onRoleRemoved={this.removeRole}
              handleOpenDeleteDialog={this.handleOpenDeleteDialog}
              handleCloseDeleteDialog={this.handleCloseDeleteDialog}
              onRoleEditSuggested={this.suggestRoleEdit}
              onRoleEditStarted={this.startRoleEdit}
              onRoleEditCancelled={this.cancelRoleEdit}
              onRolePermissionChanged={this.changeEditedRolePermission}
              onRoleNameChanged={this.changeEditedRoleName}
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
