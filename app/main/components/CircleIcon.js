import React from 'react';
import Icon from './Icon';

export const SMALL = 'small';
export const MEDIUM = 'medium';
export const LARGE = 'large';

export const SMALL_SIZE = 38;
export const MEDIUM_SIZE = 54;
export const LARGE_SIZE = 72;

export const SIZE_RATIO = 1.4;

export default React.createClass({
  displayName: 'CircleIcon',

  propTypes: {
    size: React.PropTypes.string.isRequired,
    backgroundColor: React.PropTypes.string.isRequired,
    icon: React.PropTypes.string.isRequired,
  },

  /**
   * Set the default size of icon as small.
   * @constructor
   * @param {integer} size - The defined size of icon font.
   */
  renderFontSize(size) {
    switch (size) {
      case MEDIUM: return MEDIUM_SIZE;
      case LARGE: return LARGE_SIZE;
      default: return SMALL_SIZE;
    }
  },

  render() {
    const { backgroundColor, size } = this.props;
    const fontSize = this.renderFontSize(size);

    const boxStyle = {
      backgroundColor,
      fontSize,
      width: fontSize * SIZE_RATIO,
      height: fontSize * SIZE_RATIO,
    };

    return (
      <div className="circle-icon" style={boxStyle}>
        <Icon symbol={this.props.icon} />
      </div>
    );
  },
});
