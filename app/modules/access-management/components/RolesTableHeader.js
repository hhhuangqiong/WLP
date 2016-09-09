import React, { PropTypes } from 'react';
import cx from 'classnames';

import { injectIntl, intlShape } from 'react-intl';
import ConfirmationDialog from '../../../main/components/ConfirmationDialog';
import { MESSAGES } from './../constants/i18n';

function RolesTableHeader(props) {
  function handleInputChange(e, index) {
    props.onNameChanged({
      name: e.target.value,
      roleIndex: index,
    });
  }

  function renderDeleteButton({ creating }) {
    if (creating) return null;
    return (
      <i className="fi-x"
        onClick={props.handleOpenDeleteDialog}
      />
    );
  }

  const cells = props.roles.map((role, i) => {
    const { name } = role;
    const isEdited = props.editedRoleIndex === i;
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
        />
        {renderDeleteButton(role)}
      </div>
    )
      : <span>{name}</span>;
    return (
      <th className={css} key={i} title={props.editTitle}>
        {content}
      </th>
    );
  });
  return (
    <thead className="roles-table__header">
        <ConfirmationDialog
          isOpen={props.deleteDialogOpened}
          onCancel={props.handleCloseDeleteDialog}
          onConfirm={props.handleDelete}
          cancelLabel={props.intl.formatMessage(MESSAGES.cancel)}
          confirmLabel={props.intl.formatMessage(MESSAGES.delete)}
          warning={props.intl.formatMessage(MESSAGES.warning)}
          dialogMessage={props.intl.formatMessage(MESSAGES.dialogMessage)}
          dialogHeader={props.intl.formatMessage(MESSAGES.dialogHeader)}
          name={props.editedRoleIndex ? props.roles[props.editedRoleIndex].name : null}
        />
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
  onRemoved: PropTypes.func,
  handleOpenDeleteDialog: PropTypes.func,
  deleteDialogOpened: PropTypes.bool,
  handleDelete: PropTypes.func,
  handleCloseDeleteDialog: PropTypes.func,
  roleName: PropTypes.string,
  editTitle: PropTypes.string,
};

export default injectIntl(RolesTableHeader);
