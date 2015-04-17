'use strict';
import React from 'react';
import {NavLink} from 'flux-router-component';

var Home = React.createClass({
  getInitialState: function () {
    return {};
  },
  render: function() {
    return (
      <div>
        <p>This is Home component!</p>
        <NavLink routeName="signin">to sign in</NavLink>
      </div>
    );
  }
});

export default Home;
