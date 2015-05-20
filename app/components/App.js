import React from 'react';
import {RouteHandler} from 'react-router'

var App = React.createClass({
  contextTypes: {
    router: React.PropTypes.func.isRequired
  },

  render: function() {
    let props = this.props;
    return (
      <div>
        <RouteHandler {...props} />
      </div>
    );
  }
});

module.exports = App;
