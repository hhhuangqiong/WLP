import React, { PropTypes } from 'react';
import cx from 'classnames';

import { injectIntl, intlShape } from 'react-intl';
import Permit from '../../../main/components/common/Permit';
import { RESOURCE, ACTION, permission } from '../../../main/acl/acl-enums';

const ROLE_NAME_MAX_LENGTH = 15;

function RolesTableHeader(props) {
  function handleInputChange(e, index) {
    props.onNameChanged({
    // will not allow to enter space
      name: e.target.value.trim(),
      roleIndex: index,
    });
  }

  function renderDeleteButton({ creating }) {
    if (creating) return null;
    return (
      <Permit permission={permission(RESOURCE.ROLE, ACTION.DELETE)}>
        <i className="fi-x" onClick={props.onRoleRemoveRequested} />
      </Permit>
    );
  }

  const cells = props.roles.map((role, i) => {
    const { name } = role;
    const isEdited = props.hasPermission && props.editedRoleIndex === i;
    const isHovered = !isEdited && props.hoveredRoleIndex === i;
    const css = cx({
      'roles-table__role-cell': true,
      'roles-table__role-cell--hovered': isHovered,
      'roles-table__role-cell--edited': isEdited,
    });
    const content = isEdited
      ? (
      <div className="roles-table__control-group">
        <input
          autoFocus
          type="text"
          value={name}
          onChange={e => handleInputChange(e, i)}
          maxLength={ROLE_NAME_MAX_LENGTH}
        />
        {renderDeleteButton(role)}
      </div>
    )
      : <span>{name}</span>;
    return (
      <th
        className={css}
        key={i}
        title={props.hasPermission && props.adminRoleIndex !== i ? props.editTitle : null}
      >
        {content}
      </th>
    );
  });
  return (
    <thead className="roles-table__header">
      <tr>
        <th className="roles-table__title-cell"></th>
        {cells}
        <th></th>
      </tr>
    </thead>
  );
}

RolesTableHeader.propTypes = {
  intl: intlShape.isRequired,
  roles: PropTypes.array.isRequired,
  hoveredRoleIndex: PropTypes.number,
  editedRoleIndex: PropTypes.number,
  onNameChanged: PropTypes.func,
  onRoleRemoveRequested: PropTypes.func,
  roleName: PropTypes.string,
  editTitle: PropTypes.string,
  adminRoleIndex: PropTypes.number,
  hasPermission: PropTypes.bool,
};

export default injectIntl(RolesTableHeader);
