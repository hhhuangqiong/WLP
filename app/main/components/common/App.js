import React, { PropTypes } from 'react';

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
        { this.props.children }
      </div>
    );
  },
});

module.exports = App;
