import React from 'react';
import { RouteHandler } from 'react-router';

const App = React.createClass({
  childContextTypes: {
    getAuthority: React.PropTypes.func.isRequired,
  },

  getChildContext() {
    return {
      getAuthority: this.props.context.getAuthority,
    };
  },

  render() {
    return (
      <div>
        <RouteHandler {...this.props} />
      </div>
    );
  },
});

module.exports = App;
