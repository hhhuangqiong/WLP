import React, { PropTypes } from 'react';
import classnames from 'classnames';

const CanvasWrapper = React.createClass({
  propTypes() {
    return {
      children: PropTypes.element.isRequired,
    };
  },

  render() {
    return (
      <div className={classnames('content-frame', { offcanvas: this.props.isOffCanvas })}>
        {this.props.children}
      </div>
    );
  },
});

export default CanvasWrapper;
