import React, { Component, PropTypes } from 'react';
import { injectIntl, intlShape } from 'react-intl';
import Joi from 'joi';
import cn from 'classnames';
import { isNaN } from 'lodash';
import { injectJoiValidation } from 'm800-user-locale/joi-validation';

import { MESSAGES } from '../constants/companyOptions';

import Currency from '../../../main/components/Currency';

class WalletTopUpForm extends Component {
  static get propTypes() {
    return {
      intl: intlShape.isRequired,
      wallet: PropTypes.shape({
        walletId: PropTypes.number.isRequired,
        balance: PropTypes.string.isRequired,
        currency: PropTypes.number.isRequired,
      }),
      values: PropTypes.shape({
        amount: PropTypes.string,
        description: PropTypes.string,
      }),
      onSubmit: PropTypes.func,
      onChange: PropTypes.func,
      // Properties from react-validation-mixin
      errors: PropTypes.object,
      validate: PropTypes.func,
      isValid: PropTypes.func,
      handleValidation: PropTypes.func,
      getValidationMessages: PropTypes.func,
      clearValidations: PropTypes.func,
    };
  }
  getValidatorData() {
    return this.props.values;
  }
  get validatorTypes() {
    const { intl: { formatMessage } } = this.props;
    return {
      amount: Joi.number()
        .greater(-this.props.wallet.balance)
        .label(formatMessage(MESSAGES.topUpAmount)),
    };
  }
  get canSubmit() {
    return this.props.values.amount && this.props.isValid();
  }
  handleFieldChange(name, value) {
    const { walletId, currency } = this.props.wallet;
    this.props.onChange({
      ...this.props.values,
      walletId,
      currency,
      [name]: value,
    });
  }
  handleSubmit() {
    const { values, wallet } = this.props;
    const data = {
      ...values,
      walletId: wallet.walletId,
      currency: wallet.currency,
    };
    this.props.onSubmit(data);
  }
  renderErrors(name) {
    const errors = this.props.errors[name];
    if (!errors) {
      return null;
    }
    return (
      <label>
        {errors.map((message, index) => (
          <div key={index}>{message}</div>
        ))}
      </label>
    );
  }
  render() {
    const { intl, wallet, errors } = this.props;
    const values = this.props.values || {};
    return (
      <div>
        <div className="row">
          <div className="small-6 columns">
            <label>
              {intl.formatMessage(MESSAGES.currentBalance)}
            </label>
          </div>
          <div className="small-18 columns">
            <div className="input-static">
              <Currency currencyCode={wallet.currency} amount={wallet.balance} />
            </div>
          </div>
        </div>
        <div className="row">
          <div className="small-6 columns">
            <label>
              {intl.formatMessage(MESSAGES.topUpAmount)}
            </label>
          </div>
          <div className="small-18 columns">
            <input
              className={cn('radius', { error: errors.amount })}
              type="number"
              onChange={e => this.handleFieldChange('amount', e.target.value)}
              onBlur={this.props.handleValidation('amount')}
              value={values.amount}
            />
            {this.renderErrors('amount')}
          </div>
        </div>
        <div className="row">
          <div className="small-6 columns">
            <label>
              {intl.formatMessage(MESSAGES.topUpDescription)}
            </label>
          </div>
          <div className="small-18 columns">
            <input
              className="radius"
              type="text"
              onChange={e => this.handleFieldChange('description', e.target.value)}
              value={values.description}
            />
          </div>
        </div>
        <button
          type="submit"
          className="button--primary round"
          onClick={() => this.handleSubmit()}
          disabled={!this.canSubmit}
        >
          {intl.formatMessage(MESSAGES.submit)}
        </button>
      </div>
    );
  }
}

export default injectIntl(injectJoiValidation(WalletTopUpForm));
