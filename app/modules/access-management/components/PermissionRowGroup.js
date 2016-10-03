import React, { PropTypes } from 'react';
import { injectIntl, intlShape } from 'react-intl';
import cx from 'classnames';

import { MESSAGES } from './../constants/i18n';

import Permit from '../../../main/components/common/Permit';
import { RESOURCE, ACTION, permission } from '../../../main/acl/acl-enums';

function PermissionRowGroup(props) {
  const intl = props.intl;
  const cells = [];
  for (let i = 0; i < props.rolesCount; i++) {
    const isEdited = props.showEditControls && props.editedRoleIndex === i;
    const isHovered = !isEdited && props.hoveredRoleIndex === i;
    const css = cx({
      'roles-table__role-cell': true,
      'roles-table__role-cell--hovered': isHovered,
      'roles-table__role-cell--edited': isEdited,
    });
    let content = null;
    if (props.showEditControls && isHovered && props.adminRoleIndex !== i) {
      content = (
        <Permit permission={permission(RESOURCE.ROLE, ACTION.UPDATE)}>
          <div
            className="confirmation__footer__button confirm button confirmation__button--cancel"
          >
            {intl.formatMessage(MESSAGES.edit)}
          </div>
        </Permit>
      );
    }
    if (props.showEditControls && isEdited) {
      content = (
        <Permit permission={permission(RESOURCE.ROLE, ACTION.UPDATE)}>
          <div className="roles-table__control-group">
            <button
              className="button button--no-background"
              onClick={e => {
                e.stopPropagation();
                props.onCancel();
              }}
            >
              {intl.formatMessage(MESSAGES.cancel)}
            </button>
            <button
              className="button button--no-background"
              onClick={props.onSave}
              disabled={!props.canSave}
            >
              {intl.formatMessage(MESSAGES.save)}
            </button>
          </div>
        </Permit>
      );
    }
    const cell = (
      <td
        key={i}
        className={css}
        title={props.adminRoleIndex !== i && props.showEditControls ? props.editTitle : null}
      >
      {content}
      </td>
    );
    cells.push(cell);
  }

  return (
    <tbody className="roles-table__row-group">
    <tr>
      <td className="roles-table__title-cell">
        {props.title}
      </td>
      {cells}
      <td></td>
    </tr>
    {props.children}
    </tbody>
  );
}

PermissionRowGroup.propTypes = {
  intl: intlShape.isRequired,
  rolesCount: PropTypes.number.isRequired,
  showEditControls: PropTypes.bool,
  canSave: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  editTitle: PropTypes.string,
  children: PropTypes.arrayOf(PropTypes.element),
  hoveredRoleIndex: PropTypes.number,
  editedRoleIndex: PropTypes.number,
  onCancel: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  adminRoleIndex: PropTypes.number,
};

export default injectIntl(PermissionRowGroup);
