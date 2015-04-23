'use strict';
import React from 'react';
import {NavLink} from 'flux-router-component';

var Overview = React.createClass({
  getInitialState: function () {
    return {};
  },
  render: function() {
    return (
      <div>
        <p>This is Overview component!</p>
      </div>
    );
  }
});

export default Overview;
