import React from 'react';
import classnames from 'classnames';

let CanvasWrapper = React.createClass({
  render: function() {
    return (
      <div className={classnames('content-frame', {offcanvas: this.props.isOffCanvas})}>
        {this.props.children}
      </div>
    )
  }
});

export default CanvasWrapper;
