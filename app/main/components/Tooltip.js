import React from 'react';
import classNames from 'classnames';
import _ from 'lodash';

var Tooltip = React.createClass({
  propTypes: {
    // if mouseActive is false, prop showTooltip is needed, otherwise tooltip will not be shown
    showTooltip: React.PropTypes.bool,
    mouseActive: React.PropTypes.bool,
    cssName: React.PropTypes.string,
    placement: React.PropTypes.string, // top, bottom, left, right
    tip: React.PropTypes.string,
  },

  getInitialState: function() {
    return {
      showTooltip: false
    };
  },

  componentWillReceiveProps: function(nextProps) {
    if (!nextProps.mouseActive) {
      let {showTooltip} = nextProps;
      this.setState({showTooltip});
    }
    this.handleMouseEventBinding();
  },

  componentDidMount: function() {
    this.handleMouseEventBinding();
  },

  handleMouseEventBinding() {
    let tooltipWrapper = this.refs.tooltipWrapper.getDOMNode();
    if (this.props.mouseActive) {
      tooltipWrapper.addEventListener('mouseenter', this._handleMouseEnter);
      tooltipWrapper.addEventListener('mouseleave', this._handleMouseLeave);
    } else {
      tooltipWrapper.removeEventListener('mouseenter', this._handleMouseEnter);
      tooltipWrapper.removeEventListener('mouseleave', this._handleMouseLeave);
    }
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
    let placement = 'place-' + this.props.placement;
    return (
      <div ref="tooltipWrapper" className={classNames('tooltip-wrapper', this.props.cssName)}>
        {this.props.children}
        <span ref="tooltip" className={classNames('reactTooltip', placement, 'type-dark', this.props.cssName, {hide: !this.state.showTooltip})}>
          {this.props.tip}
        </span>
      </div>
    )
  }
});

module.exports = Tooltip;
