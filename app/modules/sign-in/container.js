import React, { PropTypes, Component } from 'react';
import { connectToStores } from 'fluxible-addons-react';
import Joi from 'joi';
import { changeUsername, changePassword, signIn } from './actions/signIn';
import SignInStore from './store';
import SignIn from './components/SignIn';
import formValidation from '../../main/form-validation/containers/FormValidation';

class SignInContainer extends Component {
  constructor(props) {
    super(props);

    this.validatorTypes = {
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
    };

    this.getValidatorData = this.getValidatorData.bind(this);
    this._handleLogin = this._handleLogin.bind(this);
    this._handleChangeUsername = this._handleChangeUsername.bind(this);
    this._handleChangePassword = this._handleChangePassword.bind(this);
  }

  getValidatorData() {
    const { username, password } = this.props;

    return {
      username,
      password,
    };
  }

  _handleLogin(e) {
    e.preventDefault();
    e.stopPropagation();

    this.props.validate(error => {
      if (error) {
        return;
      }

      const { username, password } = this.props;

      this.context.executeAction(signIn, {
        username,
        password,
      });
    });
  }

  _handleChangeUsername(e) {
    const username = e.target.value;
    this.context.executeAction(changeUsername, {
      username: username && username.trim(),
    });
  }

  _handleChangePassword(e) {
    const password = e.target.value;
    this.context.executeAction(changePassword, { password });
  }

  render() {
    return (
      <SignIn
        {...this.props}
        doLogin={this._handleLogin}
        changeUsername={this._handleChangeUsername}
        changePassword={this._handleChangePassword}
      />
    );
  }
}

SignInContainer.propTypes = {
  username: PropTypes.string.isRequired,
  password: PropTypes.string.isRequired,
  // from react-validation-mixin
  errors: PropTypes.object,
  validate: PropTypes.func,
  isValid: PropTypes.func,
  handleValidation: PropTypes.func,
  getValidationMessages: PropTypes.func,
  clearValidations: PropTypes.func,
};

SignInContainer.contextTypes = {
  executeAction: PropTypes.func.isRequired,
  getStore: PropTypes.func.isRequired,
};

SignInContainer = formValidation(SignInContainer);

SignInContainer = connectToStores(
  SignInContainer,
  [SignInStore],
  context => ({ ...(context.getStore(SignInStore).getState()) })
);

export default SignInContainer;
