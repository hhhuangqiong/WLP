import React, { PropTypes } from 'react';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import Tooltip from 'rc-tooltip';
import Icon from '../../../main/components/Icon';

const renderHelpText = message => (
  <Tooltip overlay={message}>
    <a href="#" className="field-set--indicator">
      <Icon symbol="icon-error6" />
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
              (props.getValidationMessages('username') || []).map(error => {
                const errorObject = JSON.parse(error);
                const message = props.intl.formatMessage(errorObject);
                return renderHelpText(message);
              })
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
              (props.getValidationMessages('password') || []).map(error => {
                const errorObject = JSON.parse(error);
                const message = props.intl.formatMessage(errorObject);
                return renderHelpText(message);
              })
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
            id="sign-in-button"
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
  intl: intlShape.isRequired,
  username: PropTypes.string,
  password: PropTypes.string,
  doLogin: PropTypes.func.isRequired,
  getValidationMessages: PropTypes.func.isRequired,
  changeUsername: PropTypes.func.isRequired,
  changePassword: PropTypes.func.isRequired,
};

export default injectIntl(SignIn);
