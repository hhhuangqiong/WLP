import _ from 'lodash';
import debug from 'debug';
import React from 'react';
import FluxibleMixin from 'fluxible/addons/FluxibleMixin';
import {Link} from 'react-router'
import ValidationMixin from 'react-validation-mixin';
import Joi from 'joi';
import classNames from 'classnames';

import AuthStore from '../stores/AuthStore';
import SignInStore from '../stores/SignInStore';

import Tooltip from 'rc-tooltip'

import signInAction from '../actions/signIn';

import PublicOnlyMixin from '../../utils/PublicOnlyMixin';

const bootstrapDebug = debug('app:components:signin');

let SignIn = React.createClass({
  mixins: [FluxibleMixin, PublicOnlyMixin, ValidationMixin, React.addons.LinkedStateMixin],

  statics: {
    storeListeners: [AuthStore, SignInStore]
  },

  validatorTypes:  {
    username: Joi.string().email().required().label('Username'),
    password: Joi.string().min(8).max(30).required().label('Password')
  },

  getInitialState: function() {
    return _.merge({
      username: null,
      password: null
    }, this.getStateFromStores());
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

    this.validate((error, data)=>{
      if (data.username.length > 0) {
        React.findDOMNode(this.refs.username).focus();
        return;
      }

      if (data.password.length > 0) {
        React.findDOMNode(this.refs.password).focus();
        return;
      }

      if (!error) {
        let username = this.refs.username.getDOMNode().value.trim();
        let password = this.refs.password.getDOMNode().value.trim();
        //let rememberMe = this.refs.rememberMe.getDOMNode().checked;

        this.context.executeAction(signInAction, {
          username: username,
          password: password
          //rememberMe: rememberMe
        });
      }
    });
  },

  handleInputChange: function(inputName, e) {
    this.setState({
      [inputName]: e.target.value.trim()
    });
  },

  handleInputBlur: function(inputName) {
    this.validate(inputName, function(error, validationErrors) {});
  },

  renderHelpText: function(message) {
    return (
      <Tooltip overlay={message}>
        <a href="#" className="field-set--indicator"><i className="icon-error6" /></a>
      </Tooltip>
    );
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
              <div className="large-24 columns">
                <div className="field-set--validation">
                  <input
                    ref="username"
                    className="radius"
                    type="text"
                    name="username"
                    placeholder="email"
                    onChange={_.bindKey(this, 'handleInputChange', 'username')}
                    onBlur={_.bindKey(this, 'handleInputBlur', 'username')}
                  />
                  {this.getValidationMessages('username').map(this.renderHelpText)}
                </div>
              </div>
            </div>
            <div className="row">
              <div className="large-24 columns">
                <div className="field-set--validation">
                  <input
                    autoComplete="off"
                    ref="password"
                    className="radius"
                    type="password"
                    name="password"
                    placeholder="password"
                    onChange={_.bindKey(this, 'handleInputChange', 'password')}
                    onBlur={_.bindKey(this, 'handleInputBlur', 'password')}
                  />
                  {this.getValidationMessages('password').map(this.renderHelpText)}
                </div>
              </div>
            </div>
            <div className="row">
              <div className="large-16 columns">
              </div>
              <div className="large-8 columns">
                <button className="button--primary right" onClick={this.handleSignIn}>sign in</button>
              </div>
            </div>
          </div>
        </div>
      </form>
    );
  }
});

export default SignIn;
