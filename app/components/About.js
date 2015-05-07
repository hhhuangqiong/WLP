import React from 'react';
import {NavLink} from 'fluxible-router';

let About = React.createClass({
  getInitialState: function () {
    return {};
  },
  render: function() {
    return (
      <div>
        <p>About component!</p>
        <NavLink href="/page/1">Page 1</NavLink>
      </div>
    );
  }
});

export default About;
