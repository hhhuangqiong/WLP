import React, { PropTypes, Component } from 'react';
import classnames from 'classnames';
import { connectToStores } from 'fluxible-addons-react';
import Joi from 'joi';

import { injectIntl, FormattedMessage, defineMessages, intlShape } from 'react-intl';

import changePassword from '../actions/changePassword';
import ChangePasswordStore from '../stores/ChangePasswordStore';

const MESSAGES = defineMessages({
  currentPasswordPlaceholder: {
    id: 'changePassword.currentPassword.placeholder',
    defaultMessage: 'New password',
  },
  newPasswordPlaceholder: {
    id: 'changePassword.newPassword.placeholder',
    defaultMessage: 'New password',
  },
  newPasswordAgain: {
    id: 'changePassword.newPassword.again',
    defaultMessage: 'New password again',
  },
});

const PASSWORD_VALIDATION = Joi
  .string()
  .min(8)
  .max(30)
  .required();

class ChangePasswordForm extends Component {
  static contextTypes = {
    executeAction: PropTypes.func.isRequired,
    router: PropTypes.object.isRequired,
  };

  constructor() {
    super();
    this.state = this.resetState();
  }

  componentWillReceiveProps(newProps) {
    const currentPasswordIncorrectError = newProps.currentPasswordIncorrectError;

    if (!currentPasswordIncorrectError) {
      this.props.handleClose();
      this.setState(this.resetState());
      return;
    }

    this.setState({ currentPasswordIncorrectError });
  }

  onSubmit = (e) => {
    if (e.which === 13) {
      e.preventDefault();
      this.changePassword(e);
    }
  }

  setCurrentPassword = (e) => {
    e.preventDefault();

    if (this.state.currentPasswordError) this.validateCurrentPassword(e);

    this.setState({
      currentPassword: e.target.value,
      currentPasswordIncorrectError: '',
    });
  }

  setNewPassword = (e) => {
    e.preventDefault();

    if (this.state.newPasswordError) this.validateNewPassword(e);
    if (this.state.newPasswordConfirmError) this.validateNewPasswordConfirm(e);

    this.setState({ password: e.target.value });
  }

  setNewPasswordConfirm = (e) => {
    e.preventDefault();
    if (this.state.newPasswordConfirmError) this.validateNewPasswordConfirm(e);
    this.setState({ passwordConfirm: e.target.value });
  }

  containErrors = () => {
    const {
      currentPasswordError,
      currentPasswordIncorrectError,
      newPasswordError,
      newPasswordConfirmError,
    } = this.state;

    return currentPasswordError ||
      currentPasswordIncorrectError ||
      newPasswordError ||
      newPasswordConfirmError;
  }

  validateCurrentPassword = (e) => {
    e.preventDefault();
    const result = PASSWORD_VALIDATION.validate(this.state.currentPassword);
    this.setState({ currentPasswordError: result.error ? result.error.message : null });
  }

  validateNewPassword = (e) => {
    e.preventDefault();
    const result = PASSWORD_VALIDATION.validate(this.state.password);
    this.setState({ newPasswordError: result.error ? result.error.message : null });
  }

  validateNewPasswordConfirm = (e) => {
    e.preventDefault();
    const result = this.state.password !== this.state.passwordConfirm;
    this.setState({ newPasswordConfirmError: result ? 'Password is not the same' : null });
  }

  resetState() {
    return {
      currentPassword: '',
      password: '',
      passwordConfirm: '',
      currentPasswordIncorrectError: '',
    };
  }

  changePassword = (e) => {
    e.preventDefault();

    this.validateCurrentPassword(e);
    this.validateNewPassword(e);
    this.validateNewPasswordConfirm(e);

    if (this.containErrors()) return;

    const data = {
      currentPassword: this.state.currentPassword,
      password: this.state.password,
    };

    this.context.executeAction(changePassword, data);
  }

  render() {
    const { formatMessage } = this.props.intl;
    const {
      currentPasswordIncorrectError,
      currentPasswordError,
      newPasswordError,
      newPasswordConfirmError,
    } = this.state;

    return (
      <form className="change-password-form">
        <label>
          <FormattedMessage
            id="changepassword.currentpassword.label"
            defaultMessage="Please enter your current password"
          />
        </label>

        <div>
          <input
            ref="currentPassword"
            name="currentPassword"
            placeholder={formatMessage(MESSAGES.currentPasswordPlaceholder)}
            className={classnames(
              'radius',
              { error: currentPasswordIncorrectError || currentPasswordError },
            )}
            type="password"
            value={this.state.currentPassword}
            onBlur={this.validateCurrentPassword}
            onChange={this.setCurrentPassword}
            onKeyPress={this.onSubmit}
          />

          <label className={
            classnames({
              hide: !currentPasswordIncorrectError && !currentPasswordError,
            })}
          >
            {currentPasswordError || currentPasswordIncorrectError}
          </label>
        </div>

        <label>
          <FormattedMessage
            id="changepassword.newpassword.label"
            defaultMessage="and your new password"
          />
        </label>

        <div>
          <input
            ref="newPassword"
            name="newPassword"
            placeholder={formatMessage(MESSAGES.newPasswordPlaceholder)}
            className={classnames('radius', { error: newPasswordError })}
            type="password"
            value={this.state.newPassword}
            onBlur={this.validateNewPassword}
            onChange={this.setNewPassword}
            onKeyPress={this.onSubmit}
          />

          <label className={classnames({ hide: !newPasswordError })}>
            {newPasswordError}
          </label>
        </div>

        <div>
          <input
            ref="newPasswordConfirm"
            name="newPasswordConfirm"
            placeholder={formatMessage(MESSAGES.newPasswordAgain)}
            className={classnames('radius', { error: newPasswordConfirmError })}
            type="password"
            value={this.state.newPasswordConfirm}
            onBlur={this.validateNewPasswordConfirm}
            onChange={this.setNewPasswordConfirm}
            onKeyPress={this.onSubmit}
          />

          <label className={classnames({ hide: !newPasswordConfirmError })}>
            {newPasswordConfirmError}
          </label>
        </div>

        <div className="modal-controls text-center">
          <button
            className="cancel button--secondary"
            role="cancel"
            onClick={this.props.handleClose}
          >
            Cancel
          </button>

          <button
            className={classnames('button--primary', { disabled: this.containErrors() })}
            role="confirm"
            onClick={this.changePassword}
          >
            Proceed
          </button>
        </div>
      </form>
    );
  }
}

ChangePasswordForm.propTypes = {
  handleClose: PropTypes.func,
  intl: intlShape.isRequired,
};

ChangePasswordForm = connectToStores(ChangePasswordForm, [ChangePasswordStore], (context) => ({
  // eslint-disable-next-line
  currentPasswordIncorrectError: context.getStore(ChangePasswordStore).getCurrentPasswordIncorrectError(),
}));

export default injectIntl(ChangePasswordForm);
