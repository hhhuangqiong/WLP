import React from 'react';
import {RouteHandler} from 'react-router'
import SignInOrOut from './common/SignInOrOut';

const App = React.createClass({
  contextTypes: {
    router: React.PropTypes.func.isRequired
  },

  render: function() {
    return (
      <div>
        <SignInOrOut />
      </div>
    );
  }
});

module.exports = App;
