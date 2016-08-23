import React, { Component } from 'react';
import Collapse, { Panel } from 'rc-collapse';
import countryData from 'country-data';
import classNames from 'classnames';
import { Link } from 'react-router';
import * as timezoneData from 'timezones.json';
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl';
import _ from 'lodash';
import connectToStores from 'fluxible-addons-react/connectToStores';

import Icon from '../../../main/components/Icon';
import { arrayToObject } from '../../../main/components/arrayToObject';
import createCompany from '../actions/createCompany';
import CompanyProfileInfo from './CompanyProfileInfo';
import CompanyDescription from './CompanyDescription';
import CompanyCapabilities from './CompanyCapabilities';
import ApplicationStore from '../../../main/stores/ApplicationStore';

const countries = countryData.countries.all.map((item) => ({
  value: item.name,
  label: item.name,
}));

let timezoneArray = [];
_.each(timezoneData, (item) => {
  timezoneArray = timezoneArray.concat(item.utc);
});
timezoneArray = arrayToObject(timezoneArray);

const MESSAGES = defineMessages({
  companyProfile: {
    id: 'companyProfile',
    defaultMessage: 'Company Profile',
  },
  companyDescription: {
    id: 'companyDescription',
    defaultMessage: 'Company Description',
  },
  companyCapabilities: {
    id: 'companyCapabilities',
    defaultMessage: 'Company Capabilities',
  },
});

const CAPABILITIES = {
  'platform.android': 'Android',
  'platform.ios': 'IOS',
  'platform.web': 'Web',
  'call.offnet': 'Off-Net Call',
  'call.onnet': 'On-Net Call',
  'call.maaii--in': 'Maii-in Call',
  im: 'IM',
  'im.im_tosms': 'IM To SMS',
  'verification.mo': 'MO Verification',
  'verification.mt': 'MT Verification',
  'verification.sms': 'SMS Verification',
  'verification.ivr': 'IVR Verification',
  push: 'PUSH',
  vsf: 'VSF',
};

const COMPANY_TYPE = {
  SDK: 'SDK',
  WHITE_LABEL: 'WHITE LABEL',
};
const PAYMENT_TYPE = {
  PRE_PAID: 'Pre_Paid',
  POST_PAID: 'Post_Paid',
};

class CompanyProfile extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    currentCompany: React.PropTypes.object,
  }
  static contextTypes = {
    executeAction: React.PropTypes.func.isRequired,
    params: React.PropTypes.object.isRequired,
  }
  constructor(props) {
    super(props);

    // default values
    this.state = {
      companyCode: '',
      companyName: '',
      country: '',
      timezone: '',
      companyType: COMPANY_TYPE.SDK,
      paymentType: PAYMENT_TYPE.PRE_PAID,
      capabilities: [],
    };
    this.createCompany = this.createCompany.bind(this);
    this.onCompanyCodeChange = this.onCompanyCodeChange.bind(this);
    this.onCompanyNameChange = this.onCompanyNameChange.bind(this);
    this.onCompanyTypeChange = this.onCompanyTypeChange.bind(this);
    this.onPaymentTypeChange = this.onPaymentTypeChange.bind(this);
    this.onCountryChange = this.onCountryChange.bind(this);
    this.onTimezoneChange = this.onTimezoneChange.bind(this);
    this.onCapabilitiesChange = this.onCapabilitiesChange.bind(this);
  }
  onCompanyCodeChange(e) {
    // from input
    const value = e.target.value;
    this.setState({ companyCode: value });
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
    if (val) {
      const value = val.value;
      this.setState({ country: value });
    } else {
      this.setState({ country: '' });
    }
  }
  onTimezoneChange(val) {
    // from react-select
    if (val) {
      const value = val.value;
      this.setState({ timezone: value });
    } else {
      this.setState({ timezone: '' });
    }
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
      resellerCompanyId: this.props.currentCompany.id,
      resellerCarrierId: this.props.currentCompany.carrierId,
      code: this.state.companyCode,
      name: this.state.companyName,
      companyType: _.invert(COMPANY_TYPE)[this.state.companyType],
      paymentType: _.invert(PAYMENT_TYPE)[this.state.paymentType],
      country: this.state.country,
      timezone: this.state.timezone,
      capabilities: this.state.capabilities,
    };
    const { executeAction } = this.context;
    executeAction(createCompany, { data: companyInfo });
  }

  render() {
    const { intl: { formatMessage } } = this.props;
    const { identity } = this.context.params;
    return (
    <div className="company__new-profile panel">
      <div className="header inline-with-space">
        <div>
          <Link to={`/${identity}/company/overview`}><Icon symbol="icon-previous" />
          <h4 className="title-inline">
            <FormattedMessage id="createNewCompany" defaultMessage="Create New Company" />
          </h4>
          </Link>
        </div>
        <div
          role="button"
          tabIndex="0"
          className={classNames(
            'account-top-bar__button-primary',
            'button',
            'round',
            'large',
            'item',
            )
          }
          onClick={this.createCompany}
        >
          <FormattedMessage
            id="create"
            defaultMessage="Create"
          />
        </div>
      </div>
      <Collapse accordion={false} defaultActiveKey="0">
        <Panel header={`1.${formatMessage(MESSAGES.companyProfile)}`} >
          <CompanyProfileInfo
            companyCode={this.state.companyCode}
            companyType={this.state.companyType}
            paymentType={this.state.paymentType}
            onCompanyCodeChange={this.onCompanyCodeChange}
            onCompanyTypeChange={this.onCompanyTypeChange}
            onPaymentTypeChange={this.onPaymentTypeChange}
            companyTypeOption={COMPANY_TYPE}
            paymentTypeOption={PAYMENT_TYPE}
          />
        </Panel>
        <Panel header={`2.${formatMessage(MESSAGES.companyDescription)}`} >
          <CompanyDescription
            companyName={this.state.companyName}
            country={this.state.country}
            timezone={this.state.timezone}
            countryOption={countries}
            timezoneOption={timezoneArray}
            onCompanyNameChange={this.onCompanyNameChange}
            onCountryChange={this.onCountryChange}
            onTimezoneChange={this.onTimezoneChange}
          />
        </Panel>
        <Panel header={`3.${formatMessage(MESSAGES.companyCapabilities)}`} >
          <CompanyCapabilities
            capabilities={CAPABILITIES}
            capabilitiesChecked={this.state.capabilities}
            onCapabilitiesChange={this.onCapabilitiesChange}
          />
        </Panel>
      </Collapse>
    </div>
    );
  }
}

CompanyProfile = connectToStores(CompanyProfile, [ApplicationStore], (context) => ({
  currentCompany: context.getStore(ApplicationStore).getCurrentCompany(),
}));

export default injectIntl(CompanyProfile);
