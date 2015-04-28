import React from 'react';
import classNames from 'classnames';

var InfoBlock = React.createClass({
  getInitialState: function() {
    return {
      isCollapsed: false
    };
  },
  _toggleIsCollapsed: function() {
    this.setState({
      isCollapsed: !this.state.isCollapsed
    });
  },
  render: function() {
    return (
      <div className="info-panel__block">
        <div className="info-panel__block__header" onClick={this._toggleIsCollapsed}>
          <span>{this.props.title}</span>
        </div>
        <div className={classNames('info-panel__block__contents', {collapsed: this.state.isCollapsed})}>
          {this.props.children}
        </div>
      </div>
    )
  }
});

export default InfoBlock;
