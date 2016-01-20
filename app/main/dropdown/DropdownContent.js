import React, { PropTypes, Component } from 'react';
import classNames from 'classnames';

export default class DropdownContent extends Component {
  static propTypes = {
    children: PropTypes.element.isRequired,
    className: PropTypes.string.isRequired,
  };

  render() {
    return (
      <div className={classNames('dropdown-content', this.props.className)}>
        {this.props.children}
      </div>
    );
  }
}
