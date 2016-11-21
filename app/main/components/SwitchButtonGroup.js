import React, { PropTypes } from 'react';
import _ from 'lodash';
import classNames from 'classnames';

const SwitchButtonGroup = (props) => {
  const { option, selected, onChange, disabled } = props;
  return (
      <div className={ classNames('switch-button-group', { disabled }) }>
      {
        _.map(option, (item, index) => (
          <span key={index}
            className={ classNames(
              'item',
              { active: selected === item.value },
              { left: index === 0 },
              { right: index === option.length - 1 })
          }
            onClick= {() => {
              if (!disabled) {
                onChange(item.value);
              }
            }}
          >
          {item.label}
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
  option: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string,
    label: PropTypes.string,
  })).isRequired,
  /**
   * The value of the current selected.
   * @type {String}
   */
  selected: PropTypes.string,
  /**
   * The function to change the active type.
   * @type {func}
   */
  onChange: PropTypes.func,
  /**
   * Disable the button
   * @type {Boolean}
   */
  disabled: PropTypes.bool,
};

export default SwitchButtonGroup;
