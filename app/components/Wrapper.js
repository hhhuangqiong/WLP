import React from 'react';

export var UnauthenticatedHtml = React.createClass({
  propTypes: {
    children: React.PropTypes.element.isRequired
  },
  render: function() {
    return (
      <div>
        <header>
          <img className="logo" src="/images/m800-logo.png" />
        </header>
        {this.props.children}
      </div>
    )
  }
});

export var AuthenticatedHtml = React.createClass({
  propTypes: {
    children: React.PropTypes.element.isRequired
  },
  render: function() {
    return (
      <div>
        {this.props.children}
      </div>
    )
  }
});
