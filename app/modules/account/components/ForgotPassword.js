import React, { PropTypes, Component } from 'react';
import reactMixin from 'react-mixin';
import { Link } from 'react-router';
import classnames from 'classnames';
import Joi from 'joi';

import PublicOnlyMixin from '../../../utils/PublicOnlyMixin';
import validator from '../../../main/components/ValidateDecorator';
import forgotPassword from '../actions/forgotPassword';

@validator({ email: Joi
  .string()
  .email()
  .required(),
})
@reactMixin.decorate(PublicOnlyMixin)
export default class ForgotPassword extends Component {
  static contextTypes = {
    executeAction: PropTypes.func.isRequired,
    router: PropTypes.func.isRequired,
  };

  static propTypes = {
    isError: PropTypes.func.isRequired,
    validate: PropTypes.func.isRequired,
  };

  constructor() {
    super();
    this.state = { email: '' };
  }

  handleResetPassword = (e) => {
    e.preventDefault();

    if (this.props.isError() || !this.state.email.length) return;

    this.context.executeAction(forgotPassword, {
      data: { username: this.state.email },
    });

    this.setState({ email: '' });
  }

  emailOnChange = (event) => {
    if (this.props.isError()) {
      this.props.validate(event);
    }

    this.setState({ email: event.target.value });
  }

  render() {
    return (
      <form method="POST" onSubmit={this.handleResetPassword}>
        <div className="panel--extra__title row">
          <div className="large-offset-1 large-22 columns">
            <h2 className="text-center">Reset Password</h2>
          </div>
          <div className="large-offset-1 large-22 columns">
            <label className="text-center secondary">
              A reset password email will be sent to your inbox
            </label>
          </div>
        </div>
        <div className="panel--extra__body row">
          <div className="large-offset-1 large-22 columns">
            <div className="row">
              <div className="large-24 columns">
                <div className="field-set--validation">
                  <input
                    ref="email"
                    className="radius"
                    type="email"
                    name="email"
                    placeholder="Your Email"
                    value={this.state.email}
                    onChange={this.emailOnChange}
                    onBlur={this.props.validate}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="panel--extra__footer row">
          <div className="large-offset-1 large-22 columns">
            <div className="row">
              <div className="large-16 columns">
                <Link to="sign-in" className="button--secondary">Back</Link>
              </div>
              <div className="large-8 columns">
                <button
                  className={classnames(
                    'button--primary',
                    'right',
                    { disabled: !this.state.email.length || this.props.isError() }
                  )}
                  onClick={this.handleResetPassword}
                >Continue</button>
              </div>
            </div>
          </div>
        </div>

      </form>
    );
  }
}
