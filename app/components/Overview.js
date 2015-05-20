'use strict';

import React from 'react';
import AuthMixin from '../utils/AuthMixin';

var Overview = React.createClass({
  mixins: [AuthMixin],

  render: function() {
    return (
      <div>
        <p>This is Overview component!</p>
      </div>
    );
  }
});

export default Overview;
