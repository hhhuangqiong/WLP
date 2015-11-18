import React, { PropTypes, findDOMNode, Component } from 'react';
import reactMixin from 'react-mixin';
import classnames from 'classnames';
import { connectToStores } from 'fluxible/addons';

import _ from 'lodash';
import Joi from 'joi';

import changePassword from '../actions/changePassword';
import ChangePasswordStore from '../stores/ChangePasswordStore';

const PASSWORD_VALIDATION = Joi.string().min(8).max(30).required();

class ChangePasswordForm extends Component {
  static contextTypes = {
    executeAction: PropTypes.func.isRequired,
    router: PropTypes.func.isRequired
  };

  constructor() {
    super();
    this.state = this.resetState();
  }

  componentWillReceiveProps(newProps) {
    let currentPasswordIncorrectError = newProps.currentPasswordIncorrectError;

    if (!currentPasswordIncorrectError) {
      this.props.handleClose();
      this.setState(this.resetState());
      return;
    }

    this.setState({ currentPasswordIncorrectError });
  }

  resetState() {
    return {
      currentPassword: '',
      password: '',
      passwordConfirm: '',
      currentPasswordIncorrectError: ''
    };
  }

  validateCurrentPassword = (e) => {
    e.preventDefault();
    let result = PASSWORD_VALIDATION.validate(this.state.currentPassword);
    this.setState({ currentPasswordError: result.error ? result.error.message : null });
  }

  validateNewPassword = (e) => {
    e.preventDefault();
    let result = PASSWORD_VALIDATION.validate(this.state.password);
    this.setState({ newPasswordError: result.error ? result.error.message : null });
  }

  validateNewPasswordConfirm = (e) => {
    e.preventDefault();
    let result = this.state.password !== this.state.passwordConfirm;
    this.setState({ newPasswordConfirmError: result ? 'Password is not the same' : null });
  }

  containErrors = () => {
    let {
      currentPasswordError,
      currentPasswordIncorrectError,
      newPasswordError,
      newPasswordConfirmError
    } = this.state;

    return currentPasswordError || currentPasswordIncorrectError || newPasswordError || newPasswordConfirmError;
  }

  setCurrentPassword = (e) => {
    e.preventDefault();

    if (this.state.currentPasswordError) this.validateCurrentPassword(e);

    this.setState({
      currentPassword: e.target.value,
      currentPasswordIncorrectError: ''
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

  onSubmit = (e) => {
    if (e.which === 13) {
      e.preventDefault();
      this.changePassword(e);
    }
  }

  changePassword = (e) => {
    e.preventDefault();

    this.validateCurrentPassword(e);
    this.validateNewPassword(e);
    this.validateNewPasswordConfirm(e);

    if (this.containErrors()) return;

    let data = {
      currentPassword: this.state.currentPassword,
      password: this.state.password
    };

    this.context.executeAction(changePassword, data);
  }

  render() {
    let {
      currentPasswordIncorrectError,
      currentPasswordError,
      newPasswordError,
      newPasswordConfirmError
    } = this.state;

    return (
      <form className="change-password-form">
        <label>Please enter your current password</label>

        <div>
          <input
            ref="currentPassword"
            name="currentPassword"
            placeholder="New password"
            className={classnames('radius', { error: currentPasswordIncorrectError || currentPasswordError })}
            type="password"
            value={this.state.currentPassword}
            onBlur={this.validateCurrentPassword}
            onChange={this.setCurrentPassword}
            onKeyPress={this.onSubmit}
          />

          <label className={classnames({ hide: !currentPasswordIncorrectError && !currentPasswordError })}>
            {currentPasswordError || currentPasswordIncorrectError}
          </label>
        </div>

        <label>and your new password</label>

        <div>
          <input
            ref="newPassword"
            name="newPassword"
            placeholder="New password"
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
            placeholder="New password again"
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

ChangePasswordForm = connectToStores(ChangePasswordForm, [ChangePasswordStore], (stores, props) => ({
  currentPasswordIncorrectError: stores.ChangePasswordStore.getCurrentPasswordIncorrectError()
}));

export default ChangePasswordForm;
