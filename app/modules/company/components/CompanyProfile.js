import React, { Component, PropTypes } from 'react';
import Collapse, { Panel } from 'rc-collapse';
import classNames from 'classnames';
import { Link } from 'react-router';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import _ from 'lodash';
import Joi from 'joi';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { injectJoiValidation } from 'm800-user-locale/joi-validation';

import Icon from '../../../main/components/Icon';
import createCompany from '../actions/createCompany';
import fetchPreset from '../actions/fetchPreset';
import CompanyProfileInfo from './CompanyProfileInfo';
import CompanyDescription from './CompanyDescription';
import CompanyCapabilities from './CompanyCapabilities';
import ApplicationStore from '../../../main/stores/ApplicationStore';
import CompanyStore from '../stores/CompanyStore';
import {
  COUNTRIES,
  TIMEZONE,
  MESSAGES,
  CAPABILITIES,
  COMPANY_TYPE_LABEL,
  PAYMENT_TYPE_LABEL,
} from '../constants/companyOptions';

class CompanyProfile extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    currentCompany: PropTypes.object,
    // react validation mixin props types
    errors: PropTypes.object,
    validate: PropTypes.func,
    isValid: PropTypes.func,
    handleValidation: PropTypes.func,
    getValidationMessages: PropTypes.func,
    clearValidations: PropTypes.func,
    preset: React.PropTypes.object,
  }
  static contextTypes = {
    executeAction: React.PropTypes.func.isRequired,
    params: React.PropTypes.object.isRequired,
    router: React.PropTypes.object.isRequired,
  }
  constructor(props) {
    super(props);
    // default values
    this.state = {
      companyCode: '',
      companyName: '',
      country: '',
      timezone: '',
      companyType: 'SDK',
      paymentType: 'PRE_PAID',
      capabilities: [],
      token: Math.random(),
    };
    this.createCompany = this.createCompany.bind(this);
    this.onCompanyCodeChange = this.onCompanyCodeChange.bind(this);
    this.onCompanyNameChange = this.onCompanyNameChange.bind(this);
    this.onCompanyTypeChange = this.onCompanyTypeChange.bind(this);
    this.onPaymentTypeChange = this.onPaymentTypeChange.bind(this);
    this.onCountryChange = this.onCountryChange.bind(this);
    this.onTimezoneChange = this.onTimezoneChange.bind(this);
    this.onCapabilitiesChange = this.onCapabilitiesChange.bind(this);
    this.validateField = this.validateField.bind(this);
  }
  componentDidMount() {
    const { carrierId } = this.props.currentCompany;
    this.context.executeAction(fetchPreset, { carrierId });
  }

  componentWillReceiveProps(nextProps) {
    const { identity } = this.context.params;
    const { companyToken, preset } = nextProps;
    if (companyToken) {
      if (companyToken === this.state.token) {
        this.context.router.push(`/${identity}/company/overview`);
        return;
      }
    }
    // handle for the preset status
    if (preset) {
      // apply if the values exist
      if (preset.paymentType) {
        this.setState({ paymentType: preset.paymentType });
      }
      if (preset.companyType) {
        this.setState({ companyType: preset.companyType });
      }
      if (preset.capabilities) {
        // filter those which is available on the option
        this.setState({ capabilities:
          _.intersection(nextProps.preset.capabilities, _.keys(CAPABILITIES)) });
      }
    }
  }
  onCompanyNameChange(e) {
    // from input
    const value = e.target.value;
    this.setState({ companyName: value });
  }
  onCompanyCodeChange(e) {
    // from input
    const value = e.target.value;
    this.setState({ companyCode: value });
  }
  onCompanyTypeChange(value) {
    this.setState({ companyType: value });
  }
  onPaymentTypeChange(value) {
    this.setState({ paymentType: value });
  }
  onCountryChange(val = {}) {
    const value = val.value || '';
    this.setState({ country: value });
  }
  onTimezoneChange(val = {}) {
    const value = val.value || '';
    this.setState({ timezone: value });
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
  getValidatorData() {
    return this.state;
  }
  validatorTypes() {
    const { intl: { formatMessage } } = this.props;
    return {
      companyCode: Joi.string().required().regex(/^[a-zA-Z0-9]+$/)
        .label(formatMessage(MESSAGES.companyCode)),
      companyName: Joi.string().required().label(formatMessage(MESSAGES.companyName)),
      country: Joi.string().required().label(formatMessage(MESSAGES.country)),
      timezone: Joi.string().required().label(formatMessage(MESSAGES.timezone)),
    };
  }
  validateField(field) {
    return () => {
      this.props.validate(field);
    };
  }
  createCompany() {
    this.props.validate((error) => {
      if (!error) {
        const companyInfo = {
          resellerCompanyId: this.props.currentCompany.id,
          resellerCarrierId: this.props.currentCompany.carrierId,
          companyCode: this.state.companyCode,
          companyName: this.state.companyName,
          companyType: this.state.companyType,
          paymentType: this.state.paymentType,
          country: this.state.country,
          timezone: this.state.timezone,
          capabilities: this.state.capabilities,
          token: this.state.token,
          carrierId: this.context.params.identity,
        };
        const { executeAction } = this.context;
        executeAction(createCompany, companyInfo);
      }
    });
  }

  render() {
    const { intl: { formatMessage }, errors, preset } = this.props;
    const { identity } = this.context.params;
    const profileDisable = {
      companyCode: false,
      companyType: preset && !!preset.companyType,
      paymentType: preset && !!preset.paymentType,
    };
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
        <Panel header={formatMessage(MESSAGES.companyProfile)} >
          <CompanyProfileInfo
            companyCode={this.state.companyCode}
            companyType={this.state.companyType}
            paymentType={this.state.paymentType}
            onCompanyCodeChange={this.onCompanyCodeChange}
            onCompanyTypeChange={this.onCompanyTypeChange}
            onPaymentTypeChange={this.onPaymentTypeChange}
            companyTypeOption={COMPANY_TYPE_LABEL}
            paymentTypeOption={PAYMENT_TYPE_LABEL}
            validateField={this.validateField}
            errors={errors}
            disabled={profileDisable}
          />
        </Panel>
        <Panel header={formatMessage(MESSAGES.companyDescription)} >
          <CompanyDescription
            companyName={this.state.companyName}
            country={this.state.country}
            timezone={this.state.timezone}
            countryOption={COUNTRIES}
            timezoneOption={TIMEZONE}
            onCompanyNameChange={this.onCompanyNameChange}
            onCountryChange={this.onCountryChange}
            onTimezoneChange={this.onTimezoneChange}
            validateField={this.validateField}
            errors={errors}
            disabled={false}
          />
        </Panel>
        <Panel header={formatMessage(MESSAGES.companyCapabilities)} >
          <CompanyCapabilities
            capabilities={CAPABILITIES}
            disabled={this.state.disableCapabilities}
            capabilitiesChecked={this.state.capabilities}
            onCapabilitiesChange={this.onCapabilitiesChange}
            disabled={preset && !!preset.capabilities}
          />
        </Panel>
      </Collapse>
    </div>
    );
  }
}

CompanyProfile = injectIntl(injectJoiValidation(CompanyProfile));

CompanyProfile = connectToStores(CompanyProfile, [ApplicationStore, CompanyStore], (context) => ({
  currentCompany: context.getStore(ApplicationStore).getCurrentCompany(),
  companyToken: context.getStore(CompanyStore).getCompanyToken(),
  preset: context.getStore(CompanyStore).getPreset(),
}));

export default CompanyProfile;
