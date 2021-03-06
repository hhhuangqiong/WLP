import React, { Component, PropTypes } from 'react';

import Dropdown from '../dropdown';

export default class DropdownFilter extends Component {
  render() {
    return (
      <Dropdown>
        <Dropdown.Trigger>
          <nav className="dropdown-filter-button">
            <div className="text">{this.props.filterLabel}</div>
            <div className={this.props.icon}></div>
          </nav>
        </Dropdown.Trigger>

        <Dropdown.Content className="dropdown-filter">
          {this.props.children}
        </Dropdown.Content>
      </Dropdown>
    );
  }
}

DropdownFilter.propTypes = {
  children: PropTypes.element.isRequired,
  filterLabel: PropTypes.string,
  icon: PropTypes.string,
};

DropdownFilter.defaultProps = {
  filterLabel: 'Filter',
  icon: 'icon-dropdown',
};
