import _ from 'lodash';
import React, { PropTypes, Component } from 'react';
import DropdownContent from './DropdownContent';
import DropdownTrigger from './DropdownTrigger';

export default class Dropdown extends Component {
  static Content = DropdownContent;
  static Trigger = DropdownTrigger;

  render() {
    let children = this.props.children;

    return (
      <div className="dropdown-wrapper">
        { children instanceof Array ? children.map(childElement => childElement) : children }
      </div>
    );
  }
}
