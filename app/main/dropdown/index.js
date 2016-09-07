import React, { PropTypes, Component } from 'react';
import DropdownContent from './DropdownContent';
import DropdownTrigger from './DropdownTrigger';

export default class Dropdown extends Component {
  render() {
    const children = this.props.children;

    return (
      <div className="dropdown-wrapper">
        { children instanceof Array ? children.map(childElement => childElement) : children }
      </div>
    );
  }

}

Dropdown.Trigger = DropdownTrigger;
Dropdown.Content = DropdownContent;

Dropdown.propTypes = {
  children: PropTypes.node,
};
