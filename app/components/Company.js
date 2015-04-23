'use strict';
import React from 'react';
import {NavLink} from 'flux-router-component';

var Company = React.createClass({
  getInitialState: function () {
    return {};
  },
  render: function() {
    return (
      <div>
        <p>This is Company component!</p>
        <NavLink href="/page/1">Page 1</NavLink>
      </div>
    );
  }
});

export default Company;
