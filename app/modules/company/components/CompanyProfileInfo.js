import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import SwitchButtonGroup from '../../../main/components/SwitchButtonGroup';

function renderErrorMessages(errorMessages) {
  if (!errorMessages) {
    return null;
  }
  return (
    <label>
      {errorMessages.map((errorMsg, index) => (
        <div key={index}>{errorMsg}</div>
      ))}
    </label>
  );
}

const CompanyProfileInfo = (props) => {
  const {
    companyCode,
    companyType,
    paymentType,
    companyTypeOption,
    paymentTypeOption,
    onCompanyCodeChange,
    onCompanyTypeChange,
    onPaymentTypeChange,
    disabled,
    validateField,
    errors,
   } = props;
  return (
    <div className="company-profile">
      <div className="row">
        <div className="large-10 columns">
          <label>
            <FormattedMessage id="companyCode" defaultMessage="Company Code" />:
          </label>
        </div>
        <div className="large-14 columns">
          <input
            className={classNames('radius', { error: errors.companyCode })}
            type="text"
            value={companyCode}
            onChange={onCompanyCodeChange}
            onBlur={validateField('companyCode')}
            disabled={disabled ? disabled.companyCode : false}
          />
          {renderErrorMessages(errors.companyCode)}
        </div>
      </div>
      <div className="row">

        <div className="large-10 columns">
          <label>
            <FormattedMessage id="companyType" defaultMessage="Company Type" />:
          </label>
        </div>
        <div className="large-14 columns">
          <SwitchButtonGroup
            className="radius"
            types={companyTypeOption}
            currentType={companyType}
            onChange={onCompanyTypeChange}
          />
        </div>
      </div>
      <div className="row">
          <div className="large-10 columns">
          <label>
            <FormattedMessage id="paymentType" defaultMessage="Payment Type" />:
          </label>
        </div>
        <div className="large-14 columns">
          <SwitchButtonGroup
            className="radius"
            types={paymentTypeOption}
            currentType={paymentType}
            onChange={onPaymentTypeChange}
          />
        </div>
      </div>
    </div>
  );
};

CompanyProfileInfo.propTypes = {
  intl: intlShape.isRequired,
  companyCode: PropTypes.string,
  companyType: PropTypes.string,
  paymentType: PropTypes.string,
  companyTypeOption: PropTypes.object,
  paymentTypeOption: PropTypes.object,
  onCompanyCodeChange: PropTypes.func,
  onCompanyTypeChange: PropTypes.func,
  onPaymentTypeChange: PropTypes.func,
  disabled: PropTypes.object.isRequired,
  validateField: PropTypes.func,
  errors: PropTypes.object,
};

export default injectIntl(CompanyProfileInfo);
