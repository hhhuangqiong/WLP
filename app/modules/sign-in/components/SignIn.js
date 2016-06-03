import React, { PropTypes, Component } from 'react';
import { FormattedMessage, intlShape } from 'react-intl';
import Tooltip from 'rc-tooltip';
import Icon from '../../../main/components/Icon';
import Joi from 'joi';
import { injectIntl, defineMessages } from 'react-intl';
import { injectJoiValidation } from 'm800-user-locale/joi-validation';

import { signIn } from '../actions/signIn';

const MESSAGES = defineMessages({
  username: {
    id: 'joi.label.username',
    defaultMessage: 'Username',
  },
  password: {
    id: 'joi.label.password',
    defaultMessage: 'Password',
  },
})

const renderHelpText = (message, key) => (
  <Tooltip key={key} overlay={message}>
    <a href="#" className="field-set--indicator">
      <Icon symbol="icon-error6" />
    </a>
  </Tooltip>
);

class SignIn extends Component {
  constructor(props) {
    super(props);

    const { formatMessage } = props.intl;

    this.validatorTypes = {
      username: Joi
        .string()
        .email()
        .required()
        .label(formatMessage(MESSAGES.username)),
      password: Joi
        .string()
        .min(8)
        .max(30)
        .required()
        .label(formatMessage(MESSAGES.password)),
    };

    this.getValidatorData = this.getValidatorData.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
  }

  getValidatorData() {
    const { usernameRef, passwordRef } = this;

    return {
      username: usernameRef.value,
      password: passwordRef.value,
    };
  }

  handleLogin(e) {
    e.preventDefault();

    this.props.validate(error => {
      if (error) {
        return;
      }

      const { usernameRef, passwordRef } = this;

      this.context.executeAction(signIn, {
        username: usernameRef.value,
        password: passwordRef.value,
      });
    });
  }

  render() {
    const {
      handleValidation,
      getValidationMessages,
    } = this.props;

    return (
      <form method="POST" onSubmit={this.handleLogin}>
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
                  ref={ref => { this.usernameRef = ref; }}
                  className="radius"
                  type="text"
                  name="username"
                  placeholder="email"
                  onBlur={handleValidation('username')}
                  autoComplete="off"
                  autoFocus
                />
                {
                  (getValidationMessages('username') || []).map((error, key) => renderHelpText(error, key))
                }
              </div>
            </div>
          </div>
          <div className="row">
            <div className="large-24 columns">
              <div className="field-set--validation">
                <input
                  ref={ref => { this.passwordRef = ref; }}
                  autoComplete="off"
                  className="radius"
                  type="password"
                  name="password"
                  placeholder="password"
                  onBlur={handleValidation('password')}
                />
                {
                  (getValidationMessages('password') || []).map((error, key) => renderHelpText(error, key))
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
                onClick={this.handleLogin}
              >
                <FormattedMessage id="sign-in.button" defaultMessage="Sign In" />
              </button>
            </div>
          </div>
        </div>
      </form>
    );
  }
}

SignIn.contextTypes = {
  executeAction: PropTypes.func.isRequired,
};

SignIn.propTypes = {
  intl: intlShape.isRequired,
  getValidationMessages: PropTypes.func.isRequired,
  handleValidation: PropTypes.func.isRequired,
  validate: PropTypes.func.isRequired,
};

export default injectIntl(injectJoiValidation(SignIn));
