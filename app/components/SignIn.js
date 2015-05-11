import React from 'react';
import {NavLink} from 'fluxible-router';
import _ from 'lodash';
import debug from 'debug';

const bootstrapDebug = debug('wlp:components:signin');

class SignIn extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      username: '',
      password: '',
      rememberMe: false
    }
  }

  _onSubmit(e) {
    // TODO: send post request
  }

  _handleChange(stateName, event) {
    debug(stateName, event);
    // es6 computed property name
    this.setState({
      [stateName]: event.target.type == 'checkbox' ? event.target.checked : event.target.value
    });
  }

  render() {
    return (
          <form method="POST" action="/login" onSubmit={this._onSubmit}>
            <div className="panel__title--prelogin row">
              <div className="large-offset-1 large-22 columns">
                <h1 className="text-center">Sign In</h1>
              </div>
            </div>
            <div className="panel__body--prelogin row">
              <div className="large-offset-1 large-22 columns">
                <div className="row">
                  <input
                    type="text" name="username" placeholder="email"
                    value={this.state.username}
                    onChange={_.bindKey(this, '_handleChange', 'username')}
                  />
                </div>
                <div className="row">
                  <input
                    type="password" name="password" placeholder="password"
                    value={this.state.password}
                    onChange={_.bindKey(this, '_handleChange', 'password')}
                  />
                </div>
                <div className="row">
                  <NavLink routeName="forgot">Forgot password?</NavLink>
                </div>
                <div className="row">
                  <div className="large-16 columns">
                    <input
                      type="checkbox" name="rememberMe"
                      onChange={_.bindKey(this, '_handleChange', 'rememberMe')}
                    />
                    <label>Remember me</label>
                  </div>
                  <div className="large-8 columns">
                    <button className="button--primary round right" onClick={this._onSubmit}>sign in</button>
                  </div>
                </div>
              </div>
            </div>
          </form>
    );
  }
}

export default SignIn;
