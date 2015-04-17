'use strict';
import React from 'react';
import {NavLink} from 'flux-router-component';

var About = React.createClass({
  getInitialState: function () {
    return {};
  },
  render: function() {
    return (
      <div>
        <p>This is About component!</p>
        <NavLink href="/page/1">Page 1</NavLink>
        <a href="/logout">logout here</a>
      </div>
    );
  }
});

export default About;
