import React, { PropTypes } from 'react';
import cx from 'classnames';

function RolesTableHeader(props) {
  function handleInputChange(e, index) {
    props.onNameChanged({
      name: e.target.value,
      roleIndex: index,
    });
  }
  const cells = props.roleNames.map((name, i) => {
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
        <i className="fi-x" onClick={() => props.onRemoved()} />
      </div>
    )
      : <span>{name}</span>;
    return (
      <th className={css} key={i}>
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
  roleNames: PropTypes.arrayOf(PropTypes.string).isRequired,
  hoveredRoleIndex: PropTypes.number,
  editedRoleIndex: PropTypes.number,
  onNameChanged: PropTypes.func,
  onRemoved: PropTypes.func,
};

export default RolesTableHeader;
