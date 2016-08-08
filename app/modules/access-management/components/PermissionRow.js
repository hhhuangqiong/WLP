import React, { PropTypes } from 'react';
import classnames from 'classnames';

function PermissionRow(props) {
  function handleCheckBoxChange(index) {
    const checked = !props.permissionValues[index];
    const operation = checked ? 'add' : 'remove';
    props.onPermissionChanged({ operation, index });
  }

  const cells = props.permissionValues.map((value, index) => {
    const isEdited = props.editedRoleIndex === index;
    const isHovered = !isEdited && props.hoveredRoleIndex === index;
    const isDisabled = props.editedRoleIndex !== index;

    const css = classnames({
      'roles-table__role-cell': true,
      'roles-table__role-cell--hovered': isHovered,
      'roles-table__role-cell--edited': isEdited,
    });

    return (
      <td key={index} className={css}>
        <input
          type="checkbox"
          checked={value}
          disabled={isDisabled}
          onChange={ () => handleCheckBoxChange(index) }
        />
      </td>
    );
  });
  const row = (
    <tr className="roles-table__row">
      <td className="roles-table__title-cell">{props.title}</td>
      {cells}
      <td></td>
    </tr>
  );
  if (props.isChild) {
    return row;
  }
  return (
    <tbody className="roles-table__row-group">
    {row}
    </tbody>
  );
}

PermissionRow.propTypes = {
  title: PropTypes.string.isRequired,
  isChild: PropTypes.bool.isRequired,
  permissionValues: PropTypes.arrayOf(PropTypes.bool).isRequired,
  hoveredRoleIndex: PropTypes.number,
  editedRoleIndex: PropTypes.number,
  onPermissionChanged: PropTypes.func.isRequired,
};

export default PermissionRow;
