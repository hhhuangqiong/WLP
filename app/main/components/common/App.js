import React from 'react';
import {RouteHandler} from 'react-router';

var App = React.createClass({
  childContextTypes: {
    getAuthority: React.PropTypes.func.isRequired
  },

  getChildContext: function() {
    return {
      getAuthority: this.props.context.getAuthority
    };
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
