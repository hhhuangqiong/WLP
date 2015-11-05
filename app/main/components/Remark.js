import React from 'react';
import classNames from 'classnames';

var Remark = React.createClass({
  getInitialState: function() {
    return {
      showTooltip: false
    };
  },

  _handleMouseEnter: function(e) {
    this.setState({
      showTooltip: true
    });
  },

  _handleMouseLeave: function(e) {
    this.setState({
      showTooltip: false
    });
  },

  render: function() {
    return (
      <span className="calls-table__remark" onMouseEnter={this._handleMouseEnter} onMouseLeave={this._handleMouseLeave}>
        <i className="icon-error6" />
        <span ref="tooltip" className={classNames('reactTooltip', 'place-left', 'type-dark', {hide: !this.state.showTooltip})}>
          {this.props.tip}
        </span>
      </span>
    )
  }
});

module.exports = Remark;
