import React, { PropTypes, Component } from 'react';
import { Link } from 'react-router';
import classNames from 'classnames';
import Collapse, { Panel } from 'rc-collapse';
import Joi from 'joi';
import { injectJoiValidation } from 'm800-user-locale/joi-validation';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import _ from 'lodash';

import Icon from '../../../main/components/Icon';
import CompanyStore from '../stores/CompanyStore';
import CompanyProfileInfo from './CompanyProfileInfo';
import CompanyDescription from './CompanyDescription';
import CompanyCapabilities from './CompanyCapabilities';
import resetCompanyDetail from '../actions/resetCompanyDetail';
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
    // set up the initial state when data is not fetched
    // since it is not fetched, the company state will be default value in the store,
    // which reset every time
    this.state = this.getCompanyState(props);
    this.state.token = Math.random();
    this.state.fetched = false;
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
    // if it matches the company token, return to the list
    if (nextProps.companyToken && nextProps.companyToken === this.state.token) {
      this.context.router.push(`/${identity}/company/overview`);
      return;
    }
    // since the company data is fetched and update the init values
    // seed back the values into the state and only do once
    if (!this.state.fetched && nextProps.companyDetail) {
      this.setState(_.merge(this.getCompanyState(nextProps), { fetched: true }));
    }
  }
  componentWillUnmount() {
    const { executeAction } = this.context;
    executeAction(resetCompanyDetail);
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
  onCountryChange(val = {}) {
    // from react-select
    const value = val.value || '';
    this.setState({ country: value });
  }
  onTimezoneChange(val = {}) {
    // from react-select
    const value = val.value || '';
    this.setState({ timezone: value });
  }
  getCompanyState(props) {
    // the purpose of the passed down prop is to initialize and seed company values
    return {
      companyCode: props.companyDetail.companyCode,
      companyName: props.companyDetail.companyName,
      companyType: props.companyDetail.companyType,
      paymentType: props.companyDetail.paymentType,
      country: props.companyDetail.country,
      timezone: props.companyDetail.timezone,
      capabilitiesChecked: props.companyDetail.capabilities,
    };
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
  saveCompany() {
    const { companyName, country, timezone, token } = this.state;
    this.props.validate((error) => {
      if (!error) {
        const companyInfo = {
          name: companyName,
          country,
          timezone,
          token,
          companyId: this.props.companyDetail.companyId,
        };
        const { executeAction } = this.context;
        executeAction(updateProfile, companyInfo);
      }
    });
  }
  updateCompany() {
    const {
      companyCode,
      companyName,
      companyType,
      paymentType,
      country,
      timezone,
      capabilitiesChecked,
      token,
    } = this.state;
    const {
      resellerCarrierId,
      resellerCompanyId,
      id: provisionId,
   } = this.props.companyDetail;
    this.props.validate((error) => {
      if (!error) {
        const companyInfo = {
          provisionId,
          companyCode,
          companyName,
          companyType,
          paymentType,
          country,
          timezone,
          capabilities: capabilitiesChecked,
          token,
          resellerCarrierId,
          resellerCompanyId,
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
              disabled={this.props.profileDisabled}
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
              disabled={this.props.descriptionDisabled}
              validateField={this.validateField}
              errors={errors}
            />
          </Panel>
          <Panel header={formatMessage(MESSAGES.companyCapabilities)} >
            <CompanyCapabilities
              capabilities={CAPABILITIES}
              onCapabilitiesChange={this.onCapabilitiesChange}
              capabilitiesChecked={this.state.capabilitiesChecked}
              disabled={this.props.capabilitiesDisabled}
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
  profileDisabled: PropTypes.shape({
    companyCode: PropTypes.bool,
    companyType: PropTypes.bool,
    paymentType: PropTypes.bool,
  }),
  descriptionDisabled: PropTypes.bool,
  capabilitiesDisabled: PropTypes.bool,
  companyToken: PropTypes.number,
};

CompanyEditForm = injectIntl(injectJoiValidation(CompanyEditForm));

CompanyEditForm = connectToStores(CompanyEditForm, [CompanyStore], (context) => ({
  companyDetail: context.getStore(CompanyStore).getCompanyDetail(),
  profileDisabled: context.getStore(CompanyStore).getProfileDisabled(),
  descriptionDisabled: context.getStore(CompanyStore).getDescriptionDisabled(),
  capabilitiesDisabled: context.getStore(CompanyStore).getCapabilitiesDisabled(),
  companyToken: context.getStore(CompanyStore).getCompanyToken(),
}));

export default CompanyEditForm;
