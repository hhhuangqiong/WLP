import React, { PropTypes, Component } from 'react';
import _ from 'lodash';
import { Link } from 'react-router';
import classNames from 'classnames';
import countryData from 'country-data';
import timezoneData from 'timezones.json';
import Collapse, { Panel } from 'rc-collapse';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { injectIntl, intlShape, FormattedMessage, defineMessages } from 'react-intl';

import Icon from '../../../main/components/Icon';
import CompanyStore from '../stores/CompanyStore';
import CompanyProfileInfo from './CompanyProfileInfo';
import CompanyDescription from './CompanyDescription';
import CompanyCapabilities from './CompanyCapabilities';
import fetchCompanyDetail from '../actions/fetchCompanyDetail';
import updateProfile from '../actions/updateProfile';
import { arrayToObject } from '../../../main/components/arrayToObject';

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
  'im': 'IM',
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
  WHITE_LABEL: 'White Label SDK',
};

const PAYMENT_TYPE = {
  PRE_PAID: 'Pre-Paid',
  POST_PAID: 'Post Paid',
};

class CompanyEditForm extends Component {
  static contextTypes = {
    executeAction: React.PropTypes.func.isRequired,
    params: React.PropTypes.object.isRequired,
  }
  static propTypes = {
    intl: intlShape.isRequired,
  }
  constructor(props) {
    super(props);
    // default values
    this.state = {
      companyName: '',
      contactDetail: '',
      country: '',
      timezone: '',
      companyType: '',
      paymentType: '',
      capabilitiesChecked: [],
      profileAccess: true,
      descriptionAccess: true,
      capabilitiesAccess: true,
    };
    this.isChecked = this.isChecked.bind(this);
    this.saveCompany = this.saveCompany.bind(this);
    this.onCompanyNameChange = this.onCompanyNameChange.bind(this);
    this.onCompanyTypeChange = this.onCompanyTypeChange.bind(this);
    this.onPaymentTypeChange = this.onPaymentTypeChange.bind(this);
    this.onCountryChange = this.onCountryChange.bind(this);
    this.onTimezoneChange = this.onTimezoneChange.bind(this);
  }
  componentDidMount() {
    const { executeAction } = this.context;
    executeAction(fetchCompanyDetail);
  }
  componentWillReceiveProps(nextProps) {
    this.setState({
      companyId: nextProps.companyDetail.profile.companyId,
      companyCode: nextProps.companyDetail.profile.companyCode,
      companyName: nextProps.companyDetail.company.name,
      profileAccess: nextProps.profileAccess,
      descriptionAccess: nextProps.descriptionAccess,
      capabilitiesAccess: nextProps.capabilitiesAccess,
      companyType: nextProps.companyDetail.profile.serviceType,
      paymentType: nextProps.companyDetail.profile.paymentMode,
      country: nextProps.companyDetail.profile.country,
      timezone: nextProps.companyDetail.company.timezone,
      capabilitiesChecked: nextProps.companyDetail.profile.capabilities,
    });
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
    if (!this.state.profileAccess) {
      this.setState({ companyType: value });
    }
  }
  onPaymentTypeChange(value) {
    if (!this.state.profileAccess) {
      this.setState({ paymentType: value });
    }
  }
  onCountryChange(val) {
    // from react-select
    if (!this.state.descriptionAccess) {
      if (val) {
        const value = val.value;
        this.setState({ country: value });
      } else {
        this.setState({ country: '' });
      }
    }
  }
  onTimezoneChange(val) {
    // from react-select
    if (!this.state.descriptionAccess) {
      if (val) {
        const value = val.value;
        this.setState({ timezone: value });
      } else {
        this.setState({ timezone: '' });
      }
    }
  }
  saveCompany() {
    const { companyId, companyName, country, timezone } = this.state;
    const companyInfo = {
      name: companyName,
      country,
      timezone,
    };
    const { executeAction } = this.context;
    executeAction(updateProfile, { data: companyInfo, companyId });
  }
  isChecked(value) {
    if (this.state.capabilitiesChecked) {
      return this.state.capabilitiesChecked.indexOf(value) !== -1;
    }
    return null;
  }
  render() {
    const { intl: { formatMessage } } = this.props;
    const { identity } = this.context.params;
    return (
      <div className="company__new-profile">
        <div className="header inline-with-space narrow">
        <div>
          <Link to={`/${identity}/company/overview`}><Icon symbol="icon-previous" />
          <h4 className="title-inline">
            <FormattedMessage id="editCompany" defaultMessage="Edit Company" />
          </h4>
          </Link>
        </div>
        <button
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
          disabled={this.state.descriptionAccess}
          onClick={this.saveCompany}
        >
          <FormattedMessage
            id="save"
            defaultMessage="Save"
          />
        </button>
      </div>
        <Collapse accordion={false} defaultActiveKey="0">
          <Panel header={formatMessage(MESSAGES.companyProfile)} >
            <CompanyProfileInfo
              companyCode={this.state.companyCode}
              companyType={this.state.companyType}
              paymentType={this.state.paymentType}
              onCompanyTypeChange={this.onCompanyTypeChange}
              onPaymentTypeChange={this.onPaymentTypeChange}
              companyTypeOption={COMPANY_TYPE}
              paymentTypeOption={PAYMENT_TYPE}
              disabled={this.state.profileAccess}
            />
          </Panel>
          <Panel header={formatMessage(MESSAGES.companyDescription)} >
            <CompanyDescription
              companyName={this.state.companyName}
              country={this.state.country}
              timezone={this.state.timezone}
              countryOption={countries}
              timezoneOption={timezoneArray}
              onCompanyNameChange={this.onCompanyNameChange}
              onCountryChange={this.onCountryChange}
              onTimezoneChange={this.onTimezoneChange}
              disabled={this.state.descriptionAccess}
            />
          </Panel>
          <Panel header={formatMessage(MESSAGES.companyCapabilities)} >
            <CompanyCapabilities
              capabilities={CAPABILITIES}
              onCapabilitiesChange={this.onCapabilitiesChange}
              capabilitiesChecked={this.state.capabilitiesChecked}
              disabled={this.state.capabilitiesAccess}
              isChecked={this.isChecked}
            />
          </Panel>
        </Collapse>
      </div>
    );
  }
}

CompanyEditForm.propTypes = {
  companyDetail: PropTypes.object,
  profileAccess: PropTypes.bool.isRequired,
  descriptionAccess: PropTypes.bool.isRequired,
  capabilitiesAccess: PropTypes.bool.isRequired,
};

CompanyEditForm = connectToStores(CompanyEditForm, [CompanyStore], (context) => ({
  companyDetail: context.getStore(CompanyStore).getCompanyDetail(),
  profileAccess: context.getStore(CompanyStore).getProfileAccess(),
  descriptionAccess: context.getStore(CompanyStore).getDescriptionAccess(),
  capabilitiesAccess: context.getStore(CompanyStore).getCapabilitiesAccess(),
}));

export default injectIntl(CompanyEditForm);
