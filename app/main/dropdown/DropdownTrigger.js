import React, { PropTypes, Component } from 'react';

export default class DropdownTrigger extends Component {
  render() {
    return (
      <div className="dropdown-trigger">
        {this.props.children}
      </div>
    );
  }
}
