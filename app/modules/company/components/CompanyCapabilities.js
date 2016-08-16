import React from 'react';
import { FormattedMessage } from 'react-intl';

const CompanyCapabilities = () => (
  <div className="company-capabilities">
    <div className="checkbox-capabilities">
      <input type="checkbox" id="IM" />
      <label htmlFor="IM">
        <FormattedMessage id="companyCapabilitiesIm" defaultMessage="IM" />
      </label>
    </div>
    <div className="checkbox-capabilities">
      <input type="checkbox" id="On-Net" />
      <label htmlFor="On-Net">
        <FormattedMessage id="companyCapabilitiesOnNet" defaultMessage="On-Net" />
      </label>
    </div>
    <div className="checkbox-capabilities">
      <input type="checkbox" id="IM-SMS" />
      <label htmlFor="IM-SMS">
        <FormattedMessage id="companyCapabilitiesImSms" defaultMessage="IM-SMS" />
      </label>
    </div>
    <div className="checkbox-capabilities">
      <input type="checkbox" id="Push" />
      <label htmlFor="Push">
        <FormattedMessage id="companyCapabilitiesPush" defaultMessage="Push" />
      </label>
    </div>
    <div className="checkbox-capabilities">
      <input type="checkbox" id="Top Up" />
      <label htmlFor="Top Up">
        <FormattedMessage id="companyCapabilitiesTopUp" defaultMessage="Top Up" />
      </label>
    </div>
    <div className="checkbox-capabilities">
      <input type="checkbox" id="Voice" />
      <label htmlFor="Voice">
        <FormattedMessage id="companyCapabilitiesVoice" defaultMessage="Voice" />
      </label>
    </div>
    <div className="checkbox-capabilities">
      <input type="checkbox" id="Off-Net" />
      <label htmlFor="Off-Net">
        <FormattedMessage id="companyCapabilitiesOffNet" defaultMessage="Off-Net" />
      </label>
    </div>
    <div className="checkbox-capabilities">
      <input type="checkbox" id="SMS" />
      <label htmlFor="SMS">
        <FormattedMessage id="companyCapabilitiesSms" defaultMessage="SMS" />
      </label>
    </div>
    <div className="checkbox-capabilities">
      <input type="checkbox" id="API" />
      <label htmlFor="API">
        <FormattedMessage id="companyCapabilitiesApi" defaultMessage="API" />
      </label>
    </div>
    <div className="checkbox-capabilities">
      <input type="checkbox" id="Maaii-in" />
      <label htmlFor="Maaii-in">
        <FormattedMessage id="companyCapabilitiesMaaiiIn" defaultMessage="Maaii-in" />
      </label>
    </div>

  </div>
);

export default CompanyCapabilities;
