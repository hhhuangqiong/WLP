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
      <li className="accordion__item">
        <a className="accordion__item__head" onClick={this._toggleIsCollapsed}>{this.props.title}
        </a>
        <div className={classNames('accordion__item__body', {collapsed: this.state.isCollapsed})}>
          {this.props.children}
        </div>
      </li>
    )
  }
});

export default InfoBlock;
