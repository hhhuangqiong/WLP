import React, { PropTypes } from 'react';
import { injectIntl } from 'react-intl';
import cx from 'classnames';

import { MESSAGES } from './../constants/i18n';

function PermissionRowGroup(props) {
  const intl = props.intl;
  const cells = [];
  for (let i = 0; i < props.rolesCount; i++) {
    const isEdited = props.editedRoleIndex === i;
    const isHovered = !isEdited && props.hoveredRoleIndex === i;
    const css = cx({
      'roles-table__role-cell': true,
      'roles-table__role-cell--hovered': isHovered,
      'roles-table__role-cell--edited': isEdited,
    });
    let content = null;
    if (props.showEditControls && isHovered) {
      content = <span>Pencil</span>;
    }
    if (props.showEditControls && isEdited) {
      content = (
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
            onClick={() => props.onSave()}
            disabled={!props.canSave}
          >
            {intl.formatMessage(MESSAGES.save)}
          </button>
        </div>
      );
    }
    const cell = <td key={i} className={css}>{content}</td>;
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
  rolesCount: PropTypes.number.isRequired,
  showEditControls: PropTypes.bool.isRequired,
  canSave: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.arrayOf(PropTypes.element),
  hoveredRoleIndex: PropTypes.number,
  editedRoleIndex: PropTypes.number,
  onCancel: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default injectIntl(PermissionRowGroup);