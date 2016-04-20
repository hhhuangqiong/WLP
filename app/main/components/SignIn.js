import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import LinkedStateMixin from 'react-addons-linked-state-mixin';
import { FluxibleMixin } from 'fluxible-addons-react';
import ValidationMixin from 'react-validation-mixin';
import Joi from 'joi';
import { FormattedMessage } from 'react-intl';

import AuthStore from '../stores/AuthStore';
import SignInStore from '../stores/SignInStore';

import Tooltip from 'rc-tooltip';

import signInAction from '../actions/signIn';

const SignIn = React.createClass({
  mixins: [FluxibleMixin, ValidationMixin, LinkedStateMixin],

  statics: {
    storeListeners: [AuthStore, SignInStore],
  },

  getInitialState() {
    return _.merge({
      username: null,
      password: null,
    }, this.getStateFromStores());
  },

  onChange() {
    this.setState(this.getStateFromStores());
  },

  getStateFromStores() {
    return {
      numberOfTrial: this.getStore(SignInStore).getNumberOfTrial(),
      isSigningIn: this.getStore(AuthStore).isSigningIn(),
      error: this.getStore(AuthStore).getSignInError(),
    };
  },

  validatorTypes: {
    username: Joi
      .string()
      .email()
      .required()
      .label('Username'),
    password: Joi
      .string()
      .min(8)
      .max(30)
      .required()
      .label('Password'),
  },

  handleSignIn(e) {
    e.preventDefault();

    this.validate((error, data) => {
      if (data.username.length > 0) {
        ReactDOM.findDOMNode(this.refs.username).focus();
        return;
      }

      if (data.password.length > 0) {
        ReactDOM.findDOMNode(this.refs.password).focus();
        return;
      }

      if (!error) {
        const username = this
          .refs
          .username
          .getDOMNode()
          .value
          .trim();

        const password = this
          .refs
          .password
          .getDOMNode()
          .value
          .trim();
        // let rememberMe = this.refs.rememberMe.getDOMNode().checked;

        this.context.executeAction(signInAction, {
          username,
          password,
          // rememberMe: rememberMe
        });
      }
    });
  },

  handleInputChange(inputName, e) {
    this.setState({
      [inputName]: e.target.value.trim(),
    });
  },

  handleInputBlur(inputName) {
    this.validate(inputName, () => {});
  },

  renderHelpText(message) {
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
            <h1 className="text-center">
              <FormattedMessage id="sign-in.title" defaultMessage="Sign In" />
            </h1>
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
            <div className="row"><br /></div>
            <div className="row">
              <div className="large-16 columns">
                {/*
                  * Disable Forgot Password temporary until Account module is being used
                <label className="secondary">
                  <Link to="forgot-password">
                    <FormattedMessage
                      id="forgotPassword.message"
                      defaultMessage="Forgot Password"
                    />
                    <span>?</span>
                  </Link>
                </label>
                */}
              </div>
              <div className="large-8 columns">
                <button
                  id="sign-in-button"
                  className="button--primary right"
                  onClick={this.handleSignIn}
                >
                  <FormattedMessage id="sign-in.title" defaultMessage="Sign In" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    );
  },
});

export default SignIn;
