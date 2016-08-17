import React, { PropTypes } from 'react';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import SwitchButtonGroup from '../../../main/components/SwitchButtonGroup';

const CompanyProfileInfo = (props) => {
  const {
    companyName,
    companyType,
    paymentType,
    companyTypeOption,
    paymentTypeOption,
    onCompanyNameChange,
    onCompanyTypeChange,
    onPaymentTypeChange,
   } = props;
  return (
    <div>
      <div className="company-profile " defaultActiveKey = "2">
        <span className="inline header__sub">
          <FormattedMessage id="companyName" defaultMessage="Company Name" />:
        </span>
        <input className="input-name"
          type="text"
          value={companyName}
          onChange={onCompanyNameChange}
        />
      </div>
      <div className="company-profile">
        <span className="inline header__sub">
          <FormattedMessage id="companyType" defaultMessage="Company Type" />:
        </span>
        <SwitchButtonGroup
          types={companyTypeOption}
          currentType={companyType}
          onChange={onCompanyTypeChange}
        />
      </div>
      <div className="company-profile">
        <span className="inline header__sub">
          <FormattedMessage id="paymentType" defaultMessage="Payment Type" />:
        </span>
        <SwitchButtonGroup
          types={paymentTypeOption}
          currentType={paymentType}
          onChange={onPaymentTypeChange}
        />
      </div>
    </div>
  );
};

CompanyProfileInfo.propTypes = {
  intl: intlShape.isRequired,
  companyName: PropTypes.string,
  companyType: PropTypes.string,
  paymentType: PropTypes.string,
  companyTypeOption: PropTypes.object,
  paymentTypeOption: PropTypes.object,
  onCompanyNameChange: PropTypes.func,
  onCompanyTypeChange: PropTypes.func,
  onPaymentTypeChange: PropTypes.func,
};

export default injectIntl(CompanyProfileInfo);
