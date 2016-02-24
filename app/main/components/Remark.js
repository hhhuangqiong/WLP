import React from 'react';
import classNames from 'classnames';

const Remark = React.createClass({
  getInitialState() {
    return {
      showTooltip: false,
    };
  },

  _handleMouseEnter(e) {
    this.setState({
      showTooltip: true,
    });
  },

  _handleMouseLeave(e) {
    this.setState({
      showTooltip: false,
    });
  },

  render() {
    return (
      <span className="calls-table__remark" onMouseEnter={this._handleMouseEnter} onMouseLeave={this._handleMouseLeave}>
        <i className="icon-error6" />
        <span ref="tooltip" className={classNames('reactTooltip', 'place-left', 'type-dark', { hide: !this.state.showTooltip })}>
          {this.props.tip}
        </span>
      </span>
    );
  },
});

module.exports = Remark;
