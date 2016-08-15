import React, { Component, PropTypes } from 'react';
import { injectIntl } from 'react-intl';
import { isString, all, uniq } from 'lodash';
import onClickOutside from 'react-onclickoutside';

import RolesTableHeader from './RolesTableHeader';
import PermissionRowGroup from './PermissionRowGroup';
import PermissionRow from './PermissionRow';

import { MESSAGES } from './../constants/i18n';

class RolesTable extends Component {
  static propTypes() {
    return {
      intl: PropTypes.object,
      roles: PropTypes.arrayOf(PropTypes.object),
      permissions: PropTypes.arrayOf(PropTypes.object),
      editedRoleIndex: PropTypes.number,
      hoveredRoleIndex: PropTypes.number,
      onRolePermissionChanged: PropTypes.func,
      onRoleNameChanged: PropTypes.func,
      onRoleSaved: PropTypes.func,
      onRoleEditSuggested: PropTypes.func,
      onRoleEditStarted: PropTypes.func,
      onRoleEditCancelled: PropTypes.func,
      onRoleRemoved: PropTypes.func,
    };
  }
  isValid() {
    if (!this.props.roles) {
      return true;
    }
    const names = this.props.roles.map(x => x.name);
    const isValid = all(names, x => isString(x) && x.length > 0) &&
      uniq(names).length === names.length;
    return isValid;
  }
  handleClickOutside() {
    this.props.onRoleEditCancelled();
  }
  handleTableClick(e) {
    let cell = e.target;
    while (cell && !this.isTableCell(cell)) {
      cell = cell.parentNode;
    }
    if (!cell) {
      return;
    }
    const index = cell.cellIndex === 0
      ? null
      : cell.cellIndex - 1;
    if (index >= this.props.roles.length) {
      this.props.onRoleEditCancelled();
      return;
    }
    this.props.onRoleEditStarted({ index });
  }
  handleTableMouseOver(e) {
    if (!this.isTableCell(e.target)) {
      return;
    }
    const index = e.target.cellIndex === 0
      ? null
      : e.target.cellIndex - 1;
    if (index >= this.props.roles.length) {
      return;
    }
    this.props.onRoleEditSuggested({ index });
  }
  isTableCell(node) {
    return node.nodeName === 'TD' || node.nodeName === 'TH';
  }
  renderPermission(permission, isChild = false) {
    const roles = this.props.roles;
    const permissionValues = roles
      .map(x => x.permissions || {})
      .map(x => x[permission.resource] || [])
      .map(x => x.indexOf(permission.action) >= 0);
    const key = `${permission.resource}:${permission.action}`;
    return (
      <PermissionRow
        isChild={isChild}
        key={key}
        title={this.props.intl.formatMessage(MESSAGES[permission.intlKey])}
        hoveredRoleIndex={this.props.hoveredRoleIndex}
        editedRoleIndex={this.props.editedRoleIndex}
        permissionValues={permissionValues}
        onPermissionChanged={e => this.props.onRolePermissionChanged({
          operation: e.operation,
          action: permission.action,
          resource: permission.resource,
        })}
      />
    );
  }
  renderPermissionGroup(permission, index, isValid) {
    if (permission.children) {
      const childRows = permission.children.map(child => this.renderPermission(child, true));
      return (
        <PermissionRowGroup
          key={permission.intlKey}
          title={this.props.intl.formatMessage(MESSAGES[permission.intlKey])}
          showEditControls={index === 0}
          canSave={isValid}
          rolesCount={this.props.roles.length}
          hoveredRoleIndex={this.props.hoveredRoleIndex}
          editedRoleIndex={this.props.editedRoleIndex}
          onSave={() => this.props.onRoleSaved()}
          onCancel={() => this.props.onRoleEditCancelled()}
        >
          {childRows}
        </PermissionRowGroup>
      );
    }
    return this.renderPermission(permission);
  }
  render() {
    const isValid = this.isValid();
    const rows = this.props.permissions.map(
      (permission, index) => this.renderPermissionGroup(permission, index, isValid)
    );
    return (
      <table
        className="roles-table"
        onMouseOver={ e => this.handleTableMouseOver(e) }
        onClick={e => this.handleTableClick(e)}
      >
        <RolesTableHeader
          roleNames={this.props.roles.map(x => x.name)}
          hoveredRoleIndex={this.props.hoveredRoleIndex}
          editedRoleIndex={this.props.editedRoleIndex}
          onNameChanged={e => this.props.onRoleNameChanged(e)}
          onRemoved={e => this.props.onRoleRemoved(e)}
        />
        {rows}
      </table>
    );
  }
}

RolesTable = injectIntl(onClickOutside(RolesTable));

export default RolesTable;
