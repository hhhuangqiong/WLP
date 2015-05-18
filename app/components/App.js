import {concurrent} from 'contra';

import React from 'react';
import {RouteHandler} from 'react-router'
import SignInOrOut from './common/SignInOrOut';

import fetchManagingCompanies from '../actions/fetchManagingCompanies';

var App = React.createClass({
  contextTypes: {
    router: React.PropTypes.func.isRequired
  },

  statics: {
    fetchData: function(context, params, query, done) {
      concurrent([
        context.executeAction.bind(context, fetchManagingCompanies, {})
      ], done || function() {});
    }
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
