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
      </div>
    );
  }
});

export default About;
