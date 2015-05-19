'use strict';

import React from 'react';
import {Link} from 'react-router';
import AuthMixin from '../utils/AuthMixin';

var Overview = React.createClass({
  mixins: [AuthMixin],

  render: function() {
    return (
      <div>
        <p>This is Overview component!</p>
        <Link to="about">About page</Link>
      </div>
    );
  }
});

export default Overview;
