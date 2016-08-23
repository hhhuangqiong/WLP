import React, { PropTypes } from 'react';
import _ from 'lodash';
import classNames from 'classnames';

const SwitchButtonGroup = (props) => {
  const { types, currentType, onChange } = props;
  return (
      <div className="switch-button-group">
      {
        _.map(_.keys(types), (item, index) => (
          <span
            key={item}
            className={ classNames(
              'item',
              { active: currentType === item },
              { left: index === 0 },
              { right: index === _.keys(types).length - 1 })
          }
            onClick= {() => onChange(item)}
          >
          {types[item]}
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
  types: PropTypes.object,
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
