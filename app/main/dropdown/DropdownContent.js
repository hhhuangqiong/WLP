import React, { PropTypes, Component } from 'react';
import classNames from 'classnames';

export default class DropdownContent extends Component {
  render() {
    return (
      <div className={classNames('dropdown-content', this.props.className)}>
        {this.props.children}
      </div>
    );
  }
}

DropdownContent.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string.isRequired,
};
