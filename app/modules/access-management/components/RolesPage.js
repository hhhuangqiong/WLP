import React, { Component, PropTypes } from 'react';
import { isString, isNumber, without, cloneDeep, get } from 'lodash';
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
import ClientConfigStore from './../../../main/stores/ClientConfigStore';
import AuthStore from '../../../main/stores/AuthStore';
import ConfirmationDialog from '../../../main/components/ConfirmationDialog';
import Permit from '../../../main/components/common/Permit';
import { RESOURCE, ACTION, permission } from '../../../main/acl/acl-enums';


export class RolesPage extends Component {
  static get contextTypes() {
    return {
      executeAction: PropTypes.func.isRequired,
      params: PropTypes.object.isRequired,
    };
  }
  static get propTypes() {
    return {
      intl: intlShape.isRequired,
      roles: PropTypes.arrayOf(PropTypes.object),
      permissions: PropTypes.arrayOf(PropTypes.object),
      company: PropTypes.object.isRequired,
      limit: PropTypes.number,
      user: PropTypes.object,
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
      isDisableAddRole: null,
      hasPermisson: null,
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
    const { params: { identity: carrierId } } = this.context;
    this.context.executeAction(fetchRoles, { carrierId });
  }
  componentWillReceiveProps(nextProps) {
    this.state.displayedRoles = nextProps.roles;
    this.state.adminRoleIndex = _.findIndex(this.state.displayedRoles, { isRoot: true });
    this.finishRoleEdit();
    this.updateHasPermission();
  }
  updateHasPermission() {
    const permissions = get(this.props.user, 'permissions');
    if (!permissions) {
      this.setState({ hasPermission: false });
      return;
    }
    this.setState({ hasPermission: permissions.indexOf(permission(RESOURCE.ROLE, ACTION.UPDATE)) >= 0 });
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
    if (index !== this.state.adminRoleIndex) {
      const editedRoleBackup = cloneDeep(this.state.displayedRoles[index]);
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
    // if the dialog is open , the function will not be called.
    if (this.state.deleteDialogOpened) {
      return;
    }
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
    const { params: { identity: carrierId } } = this.context;
    const role = { carrierId, ...this.state.displayedRoles[this.state.editedRoleIndex] };
    const action = this.isNewRole(role) ? addRole : updateRole;
    this.context.executeAction(action, _.omit(role, ['creating']));
  }
  removeRole() {
    const { params: { identity: carrierId } } = this.context;
    const index = this.state.editedRoleIndex;
    if (!isNumber(index)) {
      return;
    }
    const role = { carrierId, ...this.state.displayedRoles[index] };
    if (_.find(this.props.roles, mRole => role.id === mRole.id)) {
      this.context.executeAction(removeRole, role);
    }
    this.handleCloseDeleteDialog();
  }

  handleOpenDeleteDialog() {
    this.setState({ deleteDialogOpened: true });
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
    const roleName = this.state.editedRoleIndex ? this.state.displayedRoles[this.state.editedRoleIndex].name : '';
    return (
      <div>
        <Panel.Wrapper className="roles-panel">
          <Panel.Header title={intl.formatMessage(MESSAGES.rolesAndPermissions)}>
            <Permit permission={permission(RESOURCE.ROLE, ACTION.CREATE)}>
              <button
                className="button radius"
                onClick={this.addRole}
                disabled={this.state.displayedRoles.length >= this.props.limit }
              >
                {intl.formatMessage(MESSAGES.addNewRole)}
              </button>
            </Permit>
          </Panel.Header>
          <Panel.Body className="roles-table-container">
            <ConfirmationDialog
              isOpen={this.state.deleteDialogOpened}
              onCancel={this.handleCloseDeleteDialog}
              onConfirm={this.removeRole}
              cancelLabel={intl.formatMessage(MESSAGES.cancel)}
              confirmLabel={intl.formatMessage(MESSAGES.delete)}
              dialogMessage={intl.formatMessage(MESSAGES.dialogMessage, { name: roleName })}
              dialogHeader={intl.formatMessage(MESSAGES.dialogHeader)}
            />
            <RolesTable
              // if permisttion is true, then it can be edited,vice versa
              hasPermission= {this.state.hasPermission}
              roles={this.state.displayedRoles}
              adminRoleIndex={this.state.adminRoleIndex}
              permissions={this.props.permissions}
              hoveredRoleIndex={this.state.hoveredRoleIndex}
              editedRoleIndex={this.state.editedRoleIndex}
              onRoleSaved={this.saveRole}
              onRoleEditSuggested={this.suggestRoleEdit}
              onRoleEditStarted={this.startRoleEdit}
              onRoleEditCancelled={this.cancelRoleEdit}
              onRoleRemoveRequested={this.handleOpenDeleteDialog}
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
  [RoleStore, ApplicationStore, ClientConfigStore, AuthStore],
  (context) => {
    const state = context.getStore(RoleStore).getState();
    state.company = context.getStore(ApplicationStore).getCurrentCompany();
    state.limit = context.getStore(ClientConfigStore).getRolesLength();
    state.user = context.getStore(AuthStore).getUser();
    return state;
  }
);

export default RolesPage;
