import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import SwitchButtonGroup from '../../../main/components/SwitchButtonGroup';
import ValidationErrorLabel from '../../../main/components/ValidationErrorLabel';
import StatusDisplay from './StatusDisplay';

const CompanyProfileInfo = (props) => {
  const {
    companyCode,
    companyType,
    paymentType,
    carrierId,
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
    <div className="company-profile company-content">
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
          <ValidationErrorLabel messages={errors.companyCode} />
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
            option={companyTypeOption}
            selected={companyType}
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
            option={paymentTypeOption}
            selected={paymentType}
            onChange={onPaymentTypeChange}
            disabled={!!disabled.paymentType}
          />
        </div>
      </div>
      { carrierId ? <div className="row">
        <div className="large-10 columns">
          <label>
            <FormattedMessage id="carrierDomain" defaultMessage="Carrier Domain" />:
          </label>
        </div>
        <div className="large-14 columns">
          <label>{carrierId}</label>
        </div>
      </div> : null }
    </div>
  );
};

CompanyProfileInfo.propTypes = {
  intl: intlShape.isRequired,
  companyCode: PropTypes.string,
  companyType: PropTypes.string,
  paymentType: PropTypes.string,
  carrierId: PropTypes.string,
  companyTypeOption: PropTypes.array,
  paymentTypeOption: PropTypes.array,
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
