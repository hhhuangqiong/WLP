import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import Tooltip from 'rc-tooltip';

const renderHelpText = message => (
  <Tooltip overlay={message}>
    <a href="#" className="field-set--indicator">
      <i className="icon-error6" />
    </a>
  </Tooltip>
);

const SignIn = props => (
  <form method="POST" onSubmit={props.doLogin}>
    <div className="panel--extra__title">
      <h1 className="text-center">
        <FormattedMessage id="sign-in.title" defaultMessage="Sign In" />
      </h1>
    </div>
    <div className="panel--extra__body">
      <div className="row">
        <div className="large-24 columns">
          <div className="field-set--validation">
            <input
              className="radius"
              type="text"
              name="username"
              placeholder="email"
              defaultValue={props.username}
              onChange={props.changeUsername}
              onBlur={props.changeUsername}
              autoComplete="off"
              autoFocus
            />
            {
              (props.getValidationMessages('username') || []).map(renderHelpText)
            }
          </div>
        </div>
      </div>
      <div className="row">
        <div className="large-24 columns">
          <div className="field-set--validation">
            <input
              autoComplete="off"
              className="radius"
              type="password"
              name="password"
              placeholder="password"
              defaultValue={props.password}
              onChange={props.changePassword}
              onBlur={props.changePassword}
            />
            {
              (props.getValidationMessages('password') || []).map(renderHelpText)
            }
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
              Forgot password?
            </Link>
          </label>
          */}
        </div>
        <div className="large-8 columns">
          <button
            className="button--primary right"
            onClick={props.doLogin}
          >
            <FormattedMessage id="sign-in.button" defaultMessage="Sign In" />
          </button>
        </div>
      </div>
    </div>
  </form>
);

SignIn.propTypes = {
  username: PropTypes.string,
  password: PropTypes.string,
  doLogin: PropTypes.func.isRequired,
  getValidationMessages: PropTypes.func.isRequired,
  changeUsername: PropTypes.func.isRequired,
  changePassword: PropTypes.func.isRequired,
};

export default SignIn;
