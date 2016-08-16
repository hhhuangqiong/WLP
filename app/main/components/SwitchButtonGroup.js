import React, { PropTypes } from 'react';
import map from 'lodash/collection/map';
import classNames from 'classnames';

const SwitchButtonGroup = (props) => {
  const { types, currentType, onChange } = props;
  return (
      <div className="switch-button-group">
      {
        map(types, (item) => (
          <span
            key={item}
            className={ classNames('item', { active: currentType === item })}
            onClick= {() => onChange(item)}
          >
          {item}
          </span>
        ))
      }
      </div>
   );
};

SwitchButtonGroup.propTypes = {
  /**
   * The array of the optional types.
   * @type {Array}
   */
  types: PropTypes.arrayOf(PropTypes.string),
  /**
   * The value of the current active type.
   * @type {String}
   */
  currentType: PropTypes.string,
  /**
   * The function to change the active type.
   * @type {func}
   */
  onChange: PropTypes.func,
};

export default SwitchButtonGroup;
