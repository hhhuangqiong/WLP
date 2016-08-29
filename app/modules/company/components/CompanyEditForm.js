import React, { PropTypes, Component } from 'react';
import { Link } from 'react-router';
import classNames from 'classnames';
import Collapse, { Panel } from 'rc-collapse';
import _ from 'lodash';
import Joi from 'joi';
import { injectJoiValidation } from 'm800-user-locale/joi-validation';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';

import Icon from '../../../main/components/Icon';
import CompanyStore from '../stores/CompanyStore';
import CompanyProfileInfo from './CompanyProfileInfo';
import CompanyDescription from './CompanyDescription';
import CompanyCapabilities from './CompanyCapabilities';
import fetchCompanyDetail from '../actions/fetchCompanyDetail';
import updateProfile from '../actions/updateProfile';
import updateCompany from '../actions/updateCompany';
import {
  COUNTRIES,
  TIMEZONE,
  MESSAGES,
  CAPABILITIES,
  COMPANY_TYPE,
  PAYMENT_TYPE,
} from '../constants/companyOptions';

class CompanyEditForm extends Component {
  static contextTypes = {
    executeAction: PropTypes.func.isRequired,
    params: PropTypes.object.isRequired,
    router: React.PropTypes.object.isRequired,
  }
  static propTypes = {
    intl: intlShape.isRequired,
    // react validation mixin props types
    errors: PropTypes.object,
    validate: PropTypes.func,
    isValid: PropTypes.func,
    handleValidation: PropTypes.func,
    getValidationMessages: PropTypes.func,
    clearValidations: PropTypes.func,
  }
  constructor(props) {
    super(props);
    // default values
    this.state = {
      companyCode: '',
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
      token: Math.random(),
    };
    this.isChecked = this.isChecked.bind(this);
    this.saveCompany = this.saveCompany.bind(this);
    this.onCompanyCodeChange = this.onCompanyCodeChange.bind(this);
    this.onCompanyNameChange = this.onCompanyNameChange.bind(this);
    this.onCompanyTypeChange = this.onCompanyTypeChange.bind(this);
    this.onPaymentTypeChange = this.onPaymentTypeChange.bind(this);
    this.onCountryChange = this.onCountryChange.bind(this);
    this.onTimezoneChange = this.onTimezoneChange.bind(this);
    this.validateField = this.validateField.bind(this);
    this.updateCompany = this.updateCompany.bind(this);
  }
  componentDidMount() {
    const { executeAction, params } = this.context;
    executeAction(fetchCompanyDetail, params.companyId);
  }
  componentWillReceiveProps(nextProps) {
    const { identity } = this.context.params;
    if (!_.isEqual(this.props.companyDetail, nextProps.companyDetail)) {
      this.setState({
        provisionId: nextProps.companyDetail.id,
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
    if (nextProps.companyToken) {
      if (nextProps.companyToken === this.state.token) {
        this.context.router.push(`/${identity}/company/overview`);
      }
    }
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
    if (!this.state.profileAccess.companyType) {
      this.setState({ companyType: value });
    }
  }
  onPaymentTypeChange(value) {
    if (!this.state.profileAccess.paymentType) {
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
  getValidatorData() {
    return this.state;
  }
  validatorTypes() {
    const { intl: { formatMessage } } = this.props;
    return {
      companyCode: Joi.string().required().regex(/^[a-zA-Z0-9]+$/).label(formatMessage(MESSAGES.companyCode)),
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
  saveCompany() {
    const { companyId, companyName, country, timezone, token } = this.state;
    this.props.validate((error) => {
      if (!error) {
        const companyInfo = {
          name: companyName,
          country,
          timezone,
          token,
          companyId,
        };
        const { executeAction } = this.context;
        executeAction(updateProfile, companyInfo);
      }
    });
  }
  updateCompany() {
    const {
      provisionId,
      companyCode,
      companyName,
      companyType,
      paymentType,
      country,
      timezone,
      capabilitiesChecked,
      token,
    } = this.state;
    this.props.validate((error) => {
      if (!error) {
        const companyInfo = {
          provisionId,
          code: companyCode,
          name: companyName,
          companyType,
          paymentType,
          country,
          timezone,
          capabilities: capabilitiesChecked,
          token,
        };
        const { executeAction } = this.context;
        executeAction(updateCompany, companyInfo);
      }
    });
  }
  isChecked(value) {
    if (this.state.capabilitiesChecked) {
      return this.state.capabilitiesChecked.indexOf(value) !== -1;
    }
    return null;
  }
  render() {
    const { intl: { formatMessage }, errors } = this.props;
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
        {
          this.props.companyDetail ?
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
            disabled={this.props.companyDetail.status === 'IN_PROGRESS' }
            onClick={
              this.props.companyDetail.status === 'ERROR' ?
              this.updateCompany :
              this.saveCompany
            }
          >
          <FormattedMessage
            id="save"
            defaultMessage="Save"
          />
          </button> :
          // display when the component doesn't receive props from store
          <button
            className={classNames(
                'account-top-bar__button-primary',
                'button',
                'round',
                'large',
                'item',
            )}
          >save</button>
        }
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
              companyTypeOption={COMPANY_TYPE}
              paymentTypeOption={PAYMENT_TYPE}
              disabled={this.props.profileAccess}
              validateField={this.validateField}
              errors={errors}
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
              disabled={this.state.descriptionAccess}
              validateField={this.validateField}
              errors={errors}
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
  profileAccess: PropTypes.object,
  descriptionAccess: PropTypes.bool,
  capabilitiesAccess: PropTypes.bool,
  companyToken: PropTypes.number,
};

CompanyEditForm = injectIntl(injectJoiValidation(CompanyEditForm));

CompanyEditForm = connectToStores(CompanyEditForm, [CompanyStore], (context) => ({
  companyDetail: context.getStore(CompanyStore).getCompanyDetail(),
  profileAccess: context.getStore(CompanyStore).getProfileAccess(),
  descriptionAccess: context.getStore(CompanyStore).getDescriptionAccess(),
  capabilitiesAccess: context.getStore(CompanyStore).getCapabilitiesAccess(),
  companyToken: context.getStore(CompanyStore).getCompanyToken(),
}));

export default CompanyEditForm;
