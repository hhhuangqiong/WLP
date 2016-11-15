import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import SwitchButtonGroup from '../../../main/components/SwitchButtonGroup';
import StatusDisplay from './StatusDisplay';

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
    status,
    handleOpenErrorDialog,
   } = props;
  return (
    <div className="company-profile">
      {
        status ?
        <StatusDisplay status={status} handleOpenErrorDialog={handleOpenErrorDialog} /> :
        null
      }
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
            disabled={!!disabled.companyCode}
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
            disabled={!!disabled.companyType}
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
            disabled={!!disabled.paymentType}
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
  disabled: PropTypes.object,
  validateField: PropTypes.func,
  errors: PropTypes.object,
  status: PropTypes.string,
  handleOpenErrorDialog: PropTypes.func,
};

export default injectIntl(CompanyProfileInfo);
