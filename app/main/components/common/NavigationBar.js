import React, { PropTypes } from 'react';

const NavigationBar = React.createClass({
  propTypes: {
    isOffCanvas: PropTypes.bool,
    children: PropTypes.oneOfType([
      PropTypes.element,
      PropTypes.array,
    ]),
  },

  shouldComponentUpdate(nextProps) {
    return nextProps.isOffCanvas === this.props.isOffCanvas;
  },

  render() {
    return (
      <nav className="top-bar app-header" data-topbar role="navigation">
        {this.props.children}
      </nav>
    );
  },
});

export default NavigationBar;
