import _ from 'lodash';
import debug from 'debug';
import React from 'react';
import {Link} from 'react-router';
import {connectToStores} from 'fluxible/addons';

import AuthStore from '../stores/AuthStore';
import SignInStore from '../stores/SignInStore';

import signIn from '../actions/signIn';

const bootstrapDebug = debug('wlp:components:signin');

class SignIn extends React.Component {
  constructor(props, context) {
    super(props, context);
  }

  handleSignIn(e){
    e.preventDefault();

    let username = this.refs.username.getDOMNode().value.trim();
    let password = this.refs.password.getDOMNode().value.trim();
    let rememberMe = this.refs.rememberMe.getDOMNode().checked;

    this.context.executeAction(signIn, {
      username: username,
      password: password,
      rememberMe: rememberMe
    });
  }

  render() {
    return (
      <form method="POST" onSubmit={this.handleSignIn.bind(this)}>
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
              <Link to="about">Forgot password?</Link>
            </div>
            <div className="row">
              <div className="large-16 columns">
                <input ref="rememberMe" type="checkbox" name="rememberMe" />
                <label>Remember me</label>
              </div>
              <div className="large-8 columns">
                <button className="button--primary round right" onClick={this.handleSignIn.bind(this)}>sign in</button>
              </div>
            </div>
          </div>
        </div>
      </form>
    );
  }
}

SignIn.contextTypes = {
  getStore: React.PropTypes.func,
  executeAction: React.PropTypes.func
};

SignIn = connectToStores(SignIn, [AuthStore, SignInStore], function (stores, props) {
  return {
    numberOfTrial: stores.SignInStore.getNumberOfTrial(),
    isSigningIn: stores.AuthStore.isSigningIn(),
    error: stores.AuthStore.getSignInError()
  };
});

export default SignIn;
