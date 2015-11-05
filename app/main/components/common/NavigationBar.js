import React from 'react';

let NavigationBar = React.createClass({
  render: function() {
    return (
      <nav className="top-bar app-header" data-topbar role="navigation">
        {this.props.children}
      </nav>
    )
  }
});

export default NavigationBar;
