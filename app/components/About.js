import React from 'react';

var Router = require('react-router');
var Link = Router.Link;

var About = React.createClass({
  getInitialState: function () {
    return {};
  },
  render: function() {
    return (
      <div>
        <p>About component!</p>
        <Link to="temp">Temporary home page</Link>
      </div>
    );
  }
});

export default About;
