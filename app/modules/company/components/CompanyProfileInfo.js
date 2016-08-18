import React, { PropTypes } from 'react';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import SwitchButtonGroup from '../../../main/components/SwitchButtonGroup';

const CompanyProfileInfo = (props) => {
  const {
    companyCode,
    companyName,
    companyType,
    paymentType,
    companyTypeOption,
    paymentTypeOption,
    onCompanyCodeChange,
    onCompanyNameChange,
    onCompanyTypeChange,
    onPaymentTypeChange,
   } = props;
  return (
    <div className="company-profile">
      <div className="row" defaultActiveKey = "2">
        <div className="large-10 columns">
          <label>
            <FormattedMessage id="companyName" defaultMessage="Company Name" />:
          </label>
        </div>
        <div className="large-14 columns">
          <input className="radius"
            type="text"
            value={companyName}
            onChange={onCompanyNameChange}
          />
        </div>
      </div>
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
  companyName: PropTypes.string,
  companyType: PropTypes.string,
  paymentType: PropTypes.string,
  companyTypeOption: PropTypes.object,
  paymentTypeOption: PropTypes.object,
  onCompanyCodeChange: PropTypes.func,
  onCompanyNameChange: PropTypes.func,
  onCompanyTypeChange: PropTypes.func,
  onPaymentTypeChange: PropTypes.func,
};

export default injectIntl(CompanyProfileInfo);
