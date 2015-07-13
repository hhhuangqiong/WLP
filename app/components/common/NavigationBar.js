import React from 'react';

let NavigationBar = React.createClass({
  shouldComponentUpdate: function(nextProps, nextState) {
    return false;
  },

  render: function() {
    return (
      <nav className="top-bar app-header" data-topbar role="navigation">
        {this.props.children}
      </nav>
    )
  }
});

export default NavigationBar;
