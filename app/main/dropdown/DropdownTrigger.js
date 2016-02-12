import React, { PropTypes, Component } from 'react';

export default class DropdownTrigger extends Component {
  static propTypes = {
    children: PropTypes.element.isRequired,
  };

  render() {
    return (
      <div className="dropdown-trigger">
        {this.props.children}
      </div>
    );
  }
}
