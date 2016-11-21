import React, { Component, PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';

import { SMSC_TYPE, SMSC_DATA_ID } from '../constants/companyOptions';
import SwitchButtonGroup from '../../../main/components/SwitchButtonGroup';
import ValidationErrorLabel from '../../../main/components/ValidationErrorLabel';

class SmscSetting extends Component {
  static propTypes = {
    option: PropTypes.array.isRequired,
    values: PropTypes.shape({
      type: PropTypes.string,
      username: PropTypes.string,
      password: PropTypes.string,
    }),
    children: PropTypes.node,
    onFieldChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired,
    isValid: PropTypes.func.isRequired,
    validateField: PropTypes.func.isRequired,
    getValidationMessages: PropTypes.func.isRequired,
  };

  renderCustomSetting() {
    const {
      values,
      onFieldChange,
      validateField,
      getValidationMessages,
      isValid,
      disabled,
      children,
    } = this.props;

    if (values.type === SMSC_TYPE.DEFAULT) {
      return null;
    }

    return (
      <div>
        <div className="row">
          <div className="large-10 columns">
            <label>
              <FormattedMessage id="username" defaultMessage="username" />:
            </label>
          </div>
          <div className="large-14 columns">
            <input
              className={classNames('radius', { error: !isValid(SMSC_DATA_ID.USERNAME) }) }
              type="text"
              value={values.username}
              onChange={(e) => onFieldChange(SMSC_DATA_ID.USERNAME, e.target.value)}
              onBlur={validateField(SMSC_DATA_ID.USERNAME)}
              disabled={disabled}
            />
            <ValidationErrorLabel messages={getValidationMessages(SMSC_DATA_ID.USERNAME)} />
          </div>
          <div className="large-10 columns">
            <label>
              <FormattedMessage id="password" defaultMessage="password" />:
            </label>
          </div>
          <div className="large-14 columns">
            <input
              className={classNames('radius', { error: !isValid(SMSC_DATA_ID.PASSWORD) }) }
              type="password"
              value={values.password}
              onChange={(e) => onFieldChange(SMSC_DATA_ID.PASSWORD, e.target.value)}
              onBlur={validateField(SMSC_DATA_ID.PASSWORD)}
              disabled={disabled}
            />
            <ValidationErrorLabel messages={getValidationMessages(SMSC_DATA_ID.PASSWORD)} />
          </div>
        </div>
        {children}
      </div>);
  }

  render() {
    const {
      option,
      values,
      onFieldChange,
      disabled,
    } = this.props;
    return (
        <div className="company-smsc-setting company-content">
          <div className="row">
            <div className="large-10 columns">
              <label>
                <FormattedMessage id="gateway" defaultMessage="Gateway" />:
              </label>
            </div>
            <div className="large-14 columns">
              <SwitchButtonGroup
                className="radius"
                option={option}
                selected={values.type}
                onChange={(value) => onFieldChange(SMSC_DATA_ID.TYPE, value)}
                disabled={disabled}
              />
            </div>
        </div>
        {this.renderCustomSetting()}
      </div>);
  }
}
export default SmscSetting;
