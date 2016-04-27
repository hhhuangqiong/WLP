import React, { PropTypes, Component } from 'react';
import classnames from 'classnames';

import _ from 'lodash';
import Joi from 'joi';

import { connectToStores } from 'fluxible-addons-react';

import createPassword from '../actions/createPassword';
import verifyAccountToken from '../actions/verifyAccountToken';
import CreatePasswordStore from '../stores/CreatePasswordStore';

import validator from '../../../main/components/ValidateDecorator';

@validator({
  password: Joi
    .string()
    .min(8)
    .max(30)
    .required(),
  passwordConfirm: 'password',
})
class CreatePassword extends Component {
  static contextTypes = {
    executeAction: PropTypes.func.isRequired,
    router: PropTypes.func.isRequired,
  };

  constructor() {
    super();
    this.state = { password: '', passwordConfirm: '' };
  }

  componentDidMount() {
    const { token } = this
      .context
      .location
      .query;

    if (!token) {
      this
        .context
        .router
        .push('sign-in');
    }

    this.context.executeAction(verifyAccountToken, { token });
  }

  componentWillReceiveProps(updatedProps) {
    /**
     * Leave the page when the token is invalid or it does not match any users
     */
    if (_.isEmpty(updatedProps.user)) {
      this
        .context
        .router
        .push('sign-in');
    }
  }

  handleChangePassword = (e) => {
    e.preventDefault();

    if (
      this.props.isError() ||
      !this.state.password.length ||
      !this.state.passwordConfirm.length
    ) {
      return;
    }

    const { token } = this
      .context
      .location
      .query;

    this.context.executeAction(createPassword, { password: this.state.password, token });
  }

  passwordOnChange = (event) => {
    if (this.props.isError()) {
      this.props.validate(event);
    }

    this.setState({ password: event.target.value });
  }

  passwordConfirmOnChange = (event) => {
    if (this.props.isError()) this.props.validate(event);
    this.setState({ passwordConfirm: event.target.value });
  }

  render() {
    return (
      <form method="POST" onSubmit={this.handleChangePassword.bind(this)}>
        <div className="panel--extra__title row">
          <div className="large-offset-1 large-22 columns">
            <h1 className="text-center">Create Password</h1>
          </div>
        </div>
        <div className="panel--extra__body row">
          <div className="large-offset-1 large-22 columns">
            <div className="row">
              <div className="large-24 columns">
                <div className="field-set--validation">
                  <input
                    ref="password"
                    className="radius"
                    type="password"
                    name="password"
                    placeholder="Your Password"
                    value={this.state.password}
                    onChange={this.passwordOnChange}
                    onBlur={this.props.validate}
                  />
                </div>
              </div>
            </div>
            <div className="row">
              <div className="large-24 columns">
                <div className="field-set--validation">
                  <input
                    ref="passwordConfirm"
                    className="radius"
                    type="password"
                    name="passwordConfirm"
                    placeholder="Please Type Again"
                    value={this.state.passwordConfirm}
                    onChange={this.passwordConfirmOnChange}
                    onBlur={this.props.validate}
                  />
                </div>
              </div>
            </div>
            <div className="row">
              <div className="large-16 columns"></div>
              <div className="large-8 columns">
                <button
                  className={classnames(
                    'button--primary',
                    'right',
                    {
                      disabled: !this.state.password.length ||
                        !this.state.passwordConfirm.length ||
                        this.props.isError(),
                    }
                  )}
                  onClick={this.handleChangePassword.bind(this)}
                >Process</button>
              </div>
            </div>
          </div>
        </div>
      </form>
    );
  }
}

CreatePassword.propTypes = {
  isError: PropTypes.bool,
  validate: PropTypes.func.isRequired,
};

CreatePassword = connectToStores(CreatePassword, [CreatePasswordStore], stores => ({
  user: stores.CreatePasswordStore.getUser(),
}));

export default CreatePassword;
