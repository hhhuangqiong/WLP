import React, { PropTypes } from 'react';
import classNames from 'classnames';
import Icon from './Icon';

const Remark = React.createClass({
  propTypes: {
    children: PropTypes.oneOfType([
      PropTypes.element,
      PropTypes.array,
    ]),
    tip: PropTypes.string,
  },

  getInitialState() {
    return {
      showTooltip: false,
    };
  },

  _handleMouseEnter() {
    this.setState({
      showTooltip: true,
    });
  },

  _handleMouseLeave() {
    this.setState({
      showTooltip: false,
    });
  },

  render() {
    return (
      <span
        className="calls-table__remark"
        onMouseEnter={this._handleMouseEnter}
        onMouseLeave={this._handleMouseLeave}
      >
        <Icon symbol="icon-error6" />
        <span
          ref="tooltip"
          className={classNames(
            'reactTooltip',
            'place-left',
            'type-dark',
            { hide: !this.state.showTooltip }
          )}
        >
          {this.props.tip}
        </span>
      </span>
    );
  },
});

module.exports = Remark;
