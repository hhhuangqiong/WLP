import React from 'react';

const NavigationBar = React.createClass({
  render() {
    return (
      <nav className="top-bar app-header" data-topbar role="navigation">
        {this.props.children}
      </nav>
    );
  },
});

export default NavigationBar;
