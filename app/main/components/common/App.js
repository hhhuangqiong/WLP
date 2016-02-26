import React, { PropTypes } from 'react';
import { RouteHandler } from 'react-router';

const App = React.createClass({
  propTypes: {
    context: PropTypes.shape({
      getAuthority: PropTypes.func.isRequired,
    }),
  },

  childContextTypes: {
    getAuthority: PropTypes.func.isRequired,
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
