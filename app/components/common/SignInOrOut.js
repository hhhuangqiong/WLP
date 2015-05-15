import React from 'react';

import Public from './Public';
import Protected from './Protected';
import AuthStore from '../../stores/AuthStore';

var FluxibleMixin = require('fluxible/addons/FluxibleMixin');
var Router = require('react-router');
var Link = Router.Link;

// not handled here
//var signOut = require('../actions/signOut');

var SignInOrOut = React.createClass({
  contextTypes: {
    router: React.PropTypes.func.isRequired
  },

  mixins: [FluxibleMixin],

  statics: {
    storeListeners: [AuthStore]
  },

  getInitialState: function() {
    return this.getStateFromStores();
  },

  getStateFromStores: function () {
    return {
      isAuthenticated: this.getStore(AuthStore).isAuthenticated(),
      isSigningOut: this.getStore(AuthStore).isSigningOut()
    };
  },

  onChange: function() {
    this.setState(this.getStateFromStores());
  },

  render: function() {
    let props = this.props;

    if (!this.state.isAuthenticated) {
      return (
        <Public {...props}/>
      )
    } else {
      return (
        <Protected {...props}/>
      )
    }
  }

  //handleSignOut: function(e) {
    //e.preventDefault();
    //this.executeAction(signOut, {});
  //}
});

module.exports = SignInOrOut;
