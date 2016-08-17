import React, { Component } from 'react';
import Collapse, { Panel } from 'rc-collapse';
import countryData from 'country-data';
import * as timezoneData from 'timezones.json';
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl';
import _ from 'lodash';

import createCompany from '../actions/createCompany';
import CompanyProfileInfo from './CompanyProfileInfo';
import CompanyDescription from './CompanyDescription';
import CompanyCapabilities from './CompanyCapabilities';

const countries = countryData.countries.all.map((item) => ({
  value: item.name,
  label: item.name,
}));

let timezoneArray = [];
_.each(timezoneData, (item) => {
  timezoneArray = timezoneArray.concat(item.utc);
});
timezoneArray = timezoneArray.map((item) => ({
  value: item,
  label: item,
}));

const MESSAGES = defineMessages({
  companyDescription: {
    id: 'companyDescription',
    defaultMessage: 'Company Description',
  },
  companyProfile: {
    id: 'companyProfile',
    defaultMessage: 'Company Profile',
  },
  companyCapabilities: {
    id: 'companyCapabilities',
    defaultMessage: 'Company Capabilities',
  },
});

const CAPABILITIES = {
  IM: 'IM',
  ON_NET: 'On-Net',
  IM_SMS: 'IM-SMS',
  PUSH: 'Push',
  TOP_UP: 'Top Up',
  VOICE: 'Voice',
  OFF_NET: 'Off-Net',
  SMS: 'SMS',
  API: 'API',
  MAAII_IN: 'Maaii-in',
};

const COMPANY_TYPE = {
  SDK: 'SDK',
  WHITE_LABEL: 'WHITE LABEL',
};
const PAYMENT_TYPE = {
  PRE_PAID: 'Pre-Paid',
  POST_PAID: 'Post Paid',
};

class CompanyProfile extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    executeAction: React.PropTypes.func.isRequired,
  }
  constructor(props) {
    super(props);

    // default values
    this.state = {
      companyName: '',
      contactDetail: '',
      country: '',
      timezone: '',
      companyType: COMPANY_TYPE.SDK,
      paymentType: PAYMENT_TYPE.PRE_PAID,
      capabilities: [],
    };
    this.createCompany = this.createCompany.bind(this);
    this.onCompanyNameChange = this.onCompanyNameChange.bind(this);
    this.onCompanyTypeChange = this.onCompanyTypeChange.bind(this);
    this.onPaymentTypeChange = this.onPaymentTypeChange.bind(this);
    this.onCountryChange = this.onCountryChange.bind(this);
    this.onTimezoneChange = this.onTimezoneChange.bind(this);
    this.onContactDetailChange = this.onContactDetailChange.bind(this);
    this.onCapabilitiesChange = this.onCapabilitiesChange.bind(this);
  }
  onCompanyNameChange(e) {
    // from input
    const value = e.target.value;
    this.setState({ companyName: value });
  }
  onCompanyTypeChange(value) {
    this.setState({ companyType: value });
  }
  onPaymentTypeChange(value) {
    this.setState({ paymentType: value });
  }
  onCountryChange(val) {
    // from react-select
    const value = val.value;
    this.setState({ country: value });
  }
  onTimezoneChange(val) {
    // from react-select
    const value = val.value;
    this.setState({ timezone: value });
  }
  onContactDetailChange(e) {
    // from input
    const value = e.target.value;
    this.setState({ contactDetail: value });
  }
  onCapabilitiesChange(e) {
    let capabilities;
    if (e.target.checked) {
      capabilities = this.state.capabilities.concat(e.target.value);
    } else {
      capabilities = this.state.capabilities;
      const index = capabilities.indexOf(e.target.value);
      capabilities.splice(index, 1);
    }
    this.setState({ capabilities });
  }
  createCompany() {
    const companyInfo = {
      name: this.state.companyName,
      companyType: this.state.companyType,
      paymentType: this.state.paymentType,
      country: this.state.country,
      timezone: this.state.timezone,
      contactDetail: this.state.contactDetail,
      capabilities: this.state.capabilities,
    };
    const { executeAction } = this.context;
    executeAction(createCompany, { data: companyInfo });
  }

  render() {
    const { intl: { formatMessage } } = this.props;
    return (
    <div className="company__new-profile">
      <div className="header inline-with-space narrow">
        <div>
          <button></button>
          <h4 className="title-inline">
            <FormattedMessage id="createNewCompany" defaultMessage="Create New Company" />
            </h4>
        </div>
        <button onClick={this.createCompany}>
          <FormattedMessage id="create" defaultMessage="Create" />
        </button>
      </div>
      <Collapse accordion={false} defaultActiveKey="0">
        <Panel header={formatMessage(MESSAGES.companyProfile)}>
          <CompanyProfileInfo
            companyName={this.state.companyName}
            companyType={this.state.companyType}
            paymentType={this.state.paymentType}
            onCompanyNameChange={this.onCompanyNameChange}
            onCompanyTypeChange={this.onCompanyTypeChange}
            onPaymentTypeChange={this.onPaymentTypeChange}
            companyTypeOption={COMPANY_TYPE}
            paymentTypeOption={PAYMENT_TYPE}
          />
        </Panel>
        <Panel header={formatMessage(MESSAGES.companyDescription)}>
          <CompanyDescription
            country={this.state.country}
            timezone={this.state.timezone}
            contactDetail={this.state.contactDetail}
            countryOption={countries}
            timezoneOption={timezoneArray}
            onCountryChange={this.onCountryChange}
            onTimezoneChange={this.onTimezoneChange}
            onContactDetailChange={this.onContactDetailChange}
          />
        </Panel>
        <Panel header={formatMessage(MESSAGES.companyCapabilities)}>
          <CompanyCapabilities
            capabilities={CAPABILITIES}
            onCapabilitiesChange={this.onCapabilitiesChange}
          />
        </Panel>
      </Collapse>
    </div>
    );
  }
}

export default injectIntl(CompanyProfile);
