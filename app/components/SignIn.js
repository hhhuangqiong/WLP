import _ from 'lodash';
import debug from 'debug';
import React from 'react';
import FluxibleMixin from 'fluxible/addons/FluxibleMixin';
import {Link} from 'react-router'

import AuthStore from '../stores/AuthStore';
import SignInStore from '../stores/SignInStore';

import signInAction from '../actions/signIn';

import PublicOnlyMixin from '../utils/PublicOnlyMixin';

const bootstrapDebug = debug('wlp:components:signin');

let SignIn = React.createClass({
  mixins: [FluxibleMixin, PublicOnlyMixin],

  statics: {
    storeListeners: [AuthStore, SignInStore]
  },

  getInitialState: function() {
    return this.getStateFromStores();
  },

  getStateFromStores: function () {
    return {
      numberOfTrial: this.getStore(SignInStore).getNumberOfTrial(),
      isSigningIn: this.getStore(AuthStore).isSigningIn(),
      error: this.getStore(AuthStore).getSignInError()
    };
  },

  onChange: function() {
    this.setState(this.getStateFromStores());
  },

  handleSignIn(e){
    e.preventDefault();

    let username = this.refs.username.getDOMNode().value.trim();
    let password = this.refs.password.getDOMNode().value.trim();
    let rememberMe = this.refs.rememberMe.getDOMNode().checked;

    this.context.executeAction(signInAction, {
      username: username,
      password: password,
      rememberMe: rememberMe
    });
  },

  render() {
    return (
      <form method="POST" onSubmit={this.handleSignIn}>
        <div className="panel--extra__title row">
          <div className="large-offset-1 large-22 columns">
            <h1 className="text-center">Sign In</h1>
          </div>
        </div>
        <div className="panel--extra__body row">
          <div className="large-offset-1 large-22 columns">
            <div className="row">
              <input ref="username" className="radius" type="text" name="username" placeholder="email" />
            </div>
            <div className="row">
              <input ref="password" className="radius" type="password" name="password" placeholder="password" />
            </div>
            <div className="row">
              <Link to="forget-password">Forgot password?</Link>
            </div>
            <div className="row">
              <div className="large-16 columns">
                <input ref="rememberMe" type="checkbox" name="rememberMe" />
                <label>Remember me</label>
              </div>
              <div className="large-8 columns">
                <button className="button--primary round right" onClick={this.handleSignIn}>sign in</button>
              </div>
            </div>
          </div>
        </div>
      </form>
    );
  }
});

export default SignIn;
