'use strict';
import React from 'react';
import {NavLink} from 'flux-router-component';
import _ from 'lodash';

var debug = require('debug')('SignIn Component');

var SignIn = React.createClass({
  getInitialState: function () {
    return {
      username: '',
      password: '',
      rememberMe: false
    };
  },
  _onSubmit: function() {
    // TODO: send post request
  },
  _handleChange: function(stateName, event) {
    debug(stateName, event);
    // es6 computed property name
    this.setState({
      [stateName]: event.target.type == 'checkbox' ? event.target.checked : event.target.value
    });
  },
  render: function() {
    return (
      <div className="row">
          <form method="POST" action="/login" onSubmit={this._onSubmit}>
            <h1>Sign In</h1>
            <div className="large-12 columns">
              <input
                type="text" name="username" placeholder="email"
                value={this.state.username}
                onChange={_.bindKey(this, '_handleChange', 'username')}
              />
            </div>
            <div className="large-12 columns">
              <input
                type="password" name="password" placeholder="password"
                value={this.state.password}
                onChange={_.bindKey(this, '_handleChange', 'password')}
              />
            </div>
            <div className="large-12 columns">
              <NavLink routeName="forgot">forgot password?</NavLink>
            </div>
            <div className="large-6 columns">
              <input
                type="checkbox" name="rememberMe"
                onChange={_.bindKey(this, '_handleChange', 'rememberMe')}
              />
              <label>remember me</label>
            </div>
            <div className="large-6 columns">
              <button className="round right" onClick={this._onSubmit}>sign in</button>
            </div>
          </form>
      </div>
    );
  }
});

export default SignIn;
