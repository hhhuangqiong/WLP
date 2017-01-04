import React, { Component, PropTypes } from 'react';
import Collapse, { Panel } from 'rc-collapse';
import classNames from 'classnames';
import { Link } from 'react-router';
import Joi from 'joi';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import _ from 'lodash';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { injectJoiValidation } from 'm800-user-locale/joi-validation';

import Icon from '../../../main/components/Icon';
import ValidationErrorLabel from '../../../main/components/ValidationErrorLabel';
import createCompany from '../actions/createCompany';
import fetchPreset from '../actions/fetchPreset';
import CompanyProfileInfo from './CompanyProfileInfo';
import CompanyDescription from './CompanyDescription';
import CompanyCapabilities from './CompanyCapabilities';
import SmscSetting from './SmscSetting';
import SmscBindingTable from './SmscBindingTable';
import SmscBindingDialog from './SmscBindingDialog';
import ApplicationStore from '../../../main/stores/ApplicationStore';
import CompanyStore from '../stores/CompanyStore';
import i18nMessages from '../../../main/constants/i18nMessages';
import { formatIntlOption } from '../../../utils/intl';
import {
  COUNTRIES,
  TIMEZONE,
  MESSAGES,
  CAPABILITIES,
  COMPANY_TYPE,
  COMPANY_OPTION,
  PAYMENT_TYPE,
  PAYMENT_OPTION,
  SMSC_OPTION,
  SMSC_TYPE,
  SMSC_DATA_ID,
} from '../constants/companyOptions';

// split companyCode in profile.companyCode
const PATH_INDEX = 1;

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
    companyCreatedError: React.PropTypes.object,
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
      companyType: COMPANY_TYPE.SDK,
      paymentType: PAYMENT_TYPE.PRE_PAID,
      capabilities: [],
      token: Math.random(),
      validationErrors: {},
    };

    // add the smsc state
    Object.assign(this.state, this.getDefaultSmsState());
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
    this.getError(nextProps.errors, nextProps.companyCreatedError);
  }
  onCompanyNameChange = (e) => {
    // from input
    const value = e.target.value;
    this.setState({ companyName: value });
  }
  onCompanyCodeChange = (e) => {
    // from input
    const value = e.target.value;
    this.setState({ companyCode: value });
  }
  onCompanyTypeChange = (value) => {
    this.setState({ companyType: value });
  }
  onPaymentTypeChange = (value) => {
    this.setState({ paymentType: value });
  }
  onCountryChange = (val = {}) => {
    const value = val.value || '';
    this.setState({ country: value });
  }
  onTimezoneChange = (val = {}) => {
    const value = val.value || '';
    this.setState({ timezone: value });
  }
  onCapabilitiesChange = (e) => {
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
  onFieldChange = (id, value) => {
    // switch smsc type will reset the state
    if (id === SMSC_DATA_ID.TYPE && value === SMSC_TYPE.DEFAULT) {
      const { smsc, smscValues } = this.getDefaultSmsState();
      this.setState({ smsc, smscValues });
      return;
    }
    const newState = this.state;
    _.set(newState, id, value);
    this.setState(newState);
  }
  // for both JOI and user error
  getError = (errors, companyCreatedError) => {
    // if JOI error occurs,UI will display JOI error
    if (!_.isEmpty(errors)) {
      this.setState({ validationErrors: errors });
      return;
    }
    if (!_.isEmpty(companyCreatedError)) {
      const validationErrors = {};
      _.forEach(companyCreatedError.details, (error) => {
        const path = error.path.split('.')[PATH_INDEX];
        if (validationErrors[path]) {
          validationErrors[path].push(error.message);
          return;
        }
        validationErrors[path] = [];
        validationErrors[path].push(error.message);
      });
      this.setState({ validationErrors });
      return;
    }
    this.setState({ validationErrors: {} });
  }
  getDefaultSmsState() {
    return {
      // smsc state
      smsc: {
        bindings: [],
        selectedBindingIndex: null,
        dialogOpened: false,
      },
      // smsc input values
      smscValues: {
        type: SMSC_TYPE.DEFAULT,
        username: '',
        password: '',
        binding: {
          ip: '',
          port: '',
        },
      },
    };
  }
  getClosingSmscDialogState = () => {
    const smsc = this.state.smsc;
    smsc.dialogOpened = false;
    const smscValues = this.state.smscValues;
    smscValues.binding = {
      ip: '',
      port: '',
    };
    return {
      smsc,
      smscValues,
    };
  }
  getValidatorData = () => {
    const data = _.pick(this.state, ['companyCode', 'companyName', 'country', 'timezone']);

    if (this.state.smscValues.type === SMSC_TYPE.DEFAULT) {
      return data;
    }

    // get the values when it is not default
    data[SMSC_DATA_ID.USERNAME] = _.get(this.state, SMSC_DATA_ID.USERNAME);
    data[SMSC_DATA_ID.PASSWORD] = _.get(this.state, SMSC_DATA_ID.PASSWORD);
    data[SMSC_DATA_ID.BINDINGS] = _.get(this.state, SMSC_DATA_ID.BINDINGS);

    if (!this.state.smsc.dialogOpened) {
      return data;
    }

    // get the dialog values when opened
    data[SMSC_DATA_ID.BINDING] = _.get(this.state, SMSC_DATA_ID.BINDING);
    return data;
  }
  validatorTypes = () => {
    const { intl: { formatMessage } } = this.props;

    // base company profile
    const companyProfileJoi = Joi.object().keys({
      companyCode: Joi.string().required().regex(/^[a-z0-9]+$/)
        .label(formatMessage(MESSAGES.companyCode)),
      companyName: Joi.string().required().label(formatMessage(MESSAGES.companyName)),
      country: Joi.string().required().label(formatMessage(MESSAGES.country)),
      timezone: Joi.string().required().label(formatMessage(MESSAGES.timezone)),
    });

    // no need to validate other field if the current smsc type is default
    if (this.state.smscValues.type === SMSC_TYPE.DEFAULT) {
      return companyProfileJoi;
    }

    // extended the companyProfile JOI when smsc type non default
    const extendedKeys = {};
    extendedKeys[SMSC_DATA_ID.USERNAME] = Joi.string().required().label(formatMessage(i18nMessages.username));
    extendedKeys[SMSC_DATA_ID.PASSWORD] = Joi.string().required().label(formatMessage(i18nMessages.password));
    extendedKeys[SMSC_DATA_ID.BINDINGS] = Joi.array().unique().min(1).required().label(formatMessage(MESSAGES.smscBinding));

    if (!this.state.smsc.dialogOpened) {
      return companyProfileJoi.keys(extendedKeys);
    }

    const bindingSchema = Joi.object().keys({
      ip: Joi.string().ip().required().label(formatMessage(MESSAGES.ip)),
      port: Joi.number().integer().required().label(formatMessage(MESSAGES.port)),
    });
    extendedKeys[SMSC_DATA_ID.BINDING] = bindingSchema;
    return companyProfileJoi.keys(extendedKeys);
  }
  validateField = (field) => () => {
    this.props.validate(field);
  }
  createCompany = () => {
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
        // only submit smsc values when it is not default
        if (this.state.smscValues.type !== SMSC_TYPE.DEFAULT) {
          companyInfo.smsc = {
            username: this.state.smscValues.username,
            password: this.state.smscValues.password,
            bindingDetails: this.state.smsc.bindings,
          };
        }
        const { executeAction } = this.context;
        executeAction(createCompany, companyInfo);
      }
    });
  }
  handleCloseSmscBindingDialog = () => {
    const { smsc, smscValues } = this.getClosingSmscDialogState();
    smsc.selectedBindingIndex = null;
    this.setState({ smsc, smscValues });
    this.props.validate(SMSC_DATA_ID.BINDING);
  }
  handleOpenSmscBindingDialog = (index = null) => {
    // update the smsc state
    const smsc = this.state.smsc;
    smsc.dialogOpened = true;
    smsc.selectedBindingIndex = index;

    const smscValues = this.state.smscValues;
    // set the dialog values
    if (index !== null) {
      smscValues.binding = _.clone(smsc.bindings[index]);
    }

    this.setState({ smsc, smscValues });
  }
  handleAddSmscBinding = (obj) => {
    this.props.validate(SMSC_DATA_ID.BINDING, err => {
      // if both input values are valid
      if (!err) {
        const { smsc, smscValues } = this.getClosingSmscDialogState();
        smsc.bindings.push(obj);
        this.setState({ smsc, smscValues });
        this.props.validate(SMSC_DATA_ID.BINDINGS);
      }
    });
  }
  handleDeleteSmscBinding = (index) => {
    const { smsc, smscValues } = this.getClosingSmscDialogState();
    smsc.bindings.splice(index, 1);
    smsc.selectedBindingIndex = null;
    this.setState({ smsc, smscValues });
    this.props.validate(SMSC_DATA_ID.BINDINGS);
  }
  handleUpdateSmscBinding = (index, obj) => {
    this.props.validate(SMSC_DATA_ID.BINDING, err => {
      // if both input values are valid
      if (!err) {
        const { smsc, smscValues } = this.getClosingSmscDialogState();
        const target = smsc.bindings[index];
        target.ip = obj.ip;
        target.port = obj.port;
        smsc.selectedBindingIndex = null;
        this.setState({ smsc, smscValues });
        this.props.validate(SMSC_DATA_ID.BINDINGS);
      }
    });
  }
  renderSmscBindingDetails() {
    const {
      smsc: { dialogOpened, bindings, selectedBindingIndex },
      smscValues: { binding },
    } = this.state;
    const { getValidationMessages, isValid } = this.props;
    if (!dialogOpened) {
      return (
      <div className="row">
        <div className="large-10 columns">
          <label>
            <FormattedMessage id="smscBinding" defaultMessage="SMSC Binding" />:
          </label>
        </div>
        <div className="large-14 columns">
        <div className="company-smsc-setting__link"
          onClick={() => this.handleOpenSmscBindingDialog()}
        >
          + <FormattedMessage id="addNewBinding" defaultMessage="Add new Binding" />
        </div>
        {
          bindings.length > 0 ?
          <SmscBindingTable
            bindings={bindings}
            handleOpenBindingDialog={this.handleOpenSmscBindingDialog}
            handleDeleteBinding={this.handleDeleteSmscBinding}
            disabled={false}
          /> : null
        }
          <ValidationErrorLabel messages={getValidationMessages(SMSC_DATA_ID.BINDINGS)} />
        </div>
      </div>);
    }

    return (
      <SmscBindingDialog
        values={binding}
        selectedBindingIndex={selectedBindingIndex}
        onFieldChange={this.onFieldChange}
        handleAddBinding={this.handleAddSmscBinding}
        handleDeleteBinding={this.handleDeleteSmscBinding}
        handleUpdateBinding={this.handleUpdateSmscBinding}
        handleCloseBindingDialog={this.handleCloseSmscBindingDialog}
        isValid={isValid}
        validateField={this.validateField}
        getValidationMessages={getValidationMessages}
      />
    );
  }
  renderPanel() {
    const { intl: { formatMessage }, preset } = this.props;
    const { identity } = this.context.params;
    const profileDisable = {
      companyCode: false,
      companyType: preset && !!preset.companyType,
      paymentType: preset && !!preset.paymentType,
    };
    const formatIntlOptionMethod = formatIntlOption.bind(null, formatMessage);
    const companyProfilePanel = (
      <Panel key="companyProfile" header={formatMessage(MESSAGES.companyProfile)} >
        <CompanyProfileInfo
          chargingRateCarrierId={identity}
          companyCode={this.state.companyCode}
          companyType={this.state.companyType}
          paymentType={this.state.paymentType}
          onCompanyCodeChange={this.onCompanyCodeChange}
          onCompanyTypeChange={this.onCompanyTypeChange}
          onPaymentTypeChange={this.onPaymentTypeChange}
          companyTypeOption={_.map(COMPANY_OPTION, formatIntlOptionMethod)}
          paymentTypeOption={_.map(PAYMENT_OPTION, formatIntlOptionMethod)}
          validateField={this.validateField}
          errors={this.state.validationErrors}
          disabled={profileDisable}
        />
      </Panel>
    );
    const companyDescriptionPanel = (
      <Panel key="companyDescription" header={formatMessage(MESSAGES.companyDescription)} >
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
          errors={this.state.validationErrors}
          disabled={false}
        />
      </Panel>
    );
    const companyCapabilitiesPanel = (
      <Panel key="companyCapabilities" header={formatMessage(MESSAGES.companyCapabilities)} >
        <CompanyCapabilities
          capabilities={CAPABILITIES}
          disabled={this.state.disableCapabilities}
          capabilitiesChecked={this.state.capabilities}
          onCapabilitiesChange={this.onCapabilitiesChange}
          disabled={preset && !!preset.capabilities}
        />
      </Panel>
    );

    const smscSettingPanel = (
      <Panel key="smscSetting" header={formatMessage(MESSAGES.smscSetting)} >
        <SmscSetting
          option={_.map(SMSC_OPTION, formatIntlOptionMethod)}
          values={this.state.smscValues}
          onFieldChange={this.onFieldChange}
          isValid={this.props.isValid}
          validateField={this.validateField}
          getValidationMessages={this.props.getValidationMessages}
          disabled={false}
        >
          {this.renderSmscBindingDetails()}
        </SmscSetting>
      </Panel>
    );

    const panel = [companyProfilePanel, companyDescriptionPanel, companyCapabilitiesPanel];

    // show the panel when having capability im to sms and sms verfication
    if (_.includes(this.state.capabilities, 'im.im-to-sms') ||
     _.includes(this.state.capabilities, 'verification.sms')) {
      panel.push(smscSettingPanel);
    }
    return panel;
  }

  render() {
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
      <Collapse accordion={false} defaultActiveKey="companyProfile">
        {this.renderPanel()}
      </Collapse>
    </div>
    );
  }
}

CompanyProfile = injectIntl(injectJoiValidation(CompanyProfile));

CompanyProfile = connectToStores(CompanyProfile,
  [ApplicationStore, CompanyStore], (context) => ({
    currentCompany: context.getStore(ApplicationStore).getCurrentCompany(),
    companyToken: context.getStore(CompanyStore).getCompanyToken(),
    preset: context.getStore(CompanyStore).getPreset(),
    companyCreatedError: context.getStore(CompanyStore).getCompanyCreatedError(),
  }));

export default CompanyProfile;
