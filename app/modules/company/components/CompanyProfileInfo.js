import React, { PropTypes } from 'react';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import SwitchButtonGroup from '../../../main/components/SwitchButtonGroup';

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
          <input className="radius"
            type="text"
            value={companyCode}
            onChange={onCompanyCodeChange}
            disabled={disabled}
          />
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
  disabled: PropTypes.bool,
};

export default injectIntl(CompanyProfileInfo);
