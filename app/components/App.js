'use strict';

var React = require('react');
var Router = require('react-router');
var Link = Router.Link;
var RouteHandler = Router.RouteHandler;

var App = React.createClass({
  contextTypes: {
    router: React.PropTypes.func.isRequired
  },

  render: function() {
    return (
      <div>
        <Link to="about">About</Link>
        <RouteHandler />
      </div>
    );
  }
});

module.exports = App;
