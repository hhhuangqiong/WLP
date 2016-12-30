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
import SmscSetting from './SmscSetting';
import resetCompanyDetail from '../actions/resetCompanyDetail';
import fetchCompanyDetail from '../actions/fetchCompanyDetail';
import updateProfile from '../actions/updateProfile';
import updateCompany from '../actions/updateCompany';
import CommonDialog from '../../../main/components/CommonDialog';
import SmscBindingTable from './SmscBindingTable';
import SmscBindingDialog from './SmscBindingDialog';
import ValidationErrorLabel from '../../../main/components/ValidationErrorLabel';
import i18nMessages from '../../../main/constants/i18nMessages';
import { formatIntlOption } from '../../../utils/intl';
import {
  COUNTRIES,
  TIMEZONE,
  MESSAGES,
  CAPABILITIES,
  COMPANY_OPTION,
  PAYMENT_OPTION,
  SMSC_OPTION,
  SMSC_TYPE,
  SMSC_DATA_ID,
} from '../constants/companyOptions';
import Permit from '../../../main/components/common/Permit';
import { RESOURCE, ACTION, permission } from '../../../main/acl/acl-enums';

// split companyCode in profile.companyCode
const PATH_INDEX = 1;
const PREVIOUS = 'icon-previous';
const NEXT = 'icon-next';

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
    this.state.currentErrorIndex = null;
    this.state.errorDialogOpened = false;
    this.state.validationErrors = {};
  }
  componentDidMount() {
    const { executeAction, params: { provisionId, identity: carrierId } } = this.context;
    executeAction(fetchCompanyDetail, { provisionId, carrierId });
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
    if (nextProps.systemErrors) {
      this.setState({ currentErrorIndex: 0 });
    }
    this.getError(nextProps.errors, nextProps.userErrors);
  }
  componentWillUnmount() {
    const { executeAction } = this.context;
    executeAction(resetCompanyDetail);
  }
  onCompanyCodeChange = (e) => {
    // from input
    const value = e.target.value;
    this.setState({ companyCode: value });
  }
  onCompanyNameChange = (e) => {
    // from input
    const value = e.target.value;
    this.setState({ companyName: value });
  }
  onCompanyTypeChange = (value) => {
    this.setState({ companyType: value });
  }
  onPaymentTypeChange = (value) => {
    this.setState({ paymentType: value });
  }
  onCountryChange = (val = {}) => {
    // from react-select
    const value = val.value || '';
    this.setState({ country: value });
  }
  onTimezoneChange = (val = {}) => {
    // from react-select
    const value = val.value || '';
    this.setState({ timezone: value });
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
  getCompanyState(props) {
    return {
      // the purpose of the passed down prop is to initialize and seed company values
      companyCode: props.companyDetail.companyCode,
      companyName: props.companyDetail.companyName,
      companyType: props.companyDetail.companyType,
      paymentType: props.companyDetail.paymentType,
      country: props.companyDetail.country,
      timezone: props.companyDetail.timezone,
      capabilitiesChecked: props.companyDetail.capabilities,
      smscValues: {
        type: _.get(props.companyDetail, 'smsc') ? SMSC_TYPE.CUSTOM : SMSC_TYPE.DEFAULT,
        username: _.get(props.companyDetail, 'smsc.username') || '',
        password: _.get(props.companyDetail, 'smsc.password') || '',
        binding: {
          ip: '',
          port: '',
        },
      },
      smsc: {
        bindings: _.get(props.companyDetail, 'smsc.bindingDetails') || [],
        selectedBindingIndex: null,
        dialogOpened: false,
      },
    };
  }
  // for both JOI and user error
  getError = (errors, userErrors) => {
    // if JOI error occurs,UI will display JOI error
    if (!_.isEmpty(errors)) {
      this.setState({ validationErrors: errors });
      return;
    }
    if (!_.isEmpty(userErrors)) {
      const validationErrors = {};
      _.forEach(userErrors, (error) => {
        if (!error.path) {
          return;
        }
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
  handleOpenErrorDialog = () => {
    this.setState({ errorDialogOpened: true });
  }
  handleSystemErrorChange = (direction) => {
    const currentErrorIndex = this.state.currentErrorIndex;
    if (direction === PREVIOUS && currentErrorIndex > 0) {
      this.setState({ currentErrorIndex: currentErrorIndex - 1 });
    }
    if (direction === NEXT && currentErrorIndex < this.props.systemErrors.length - 1) {
      this.setState({ currentErrorIndex: currentErrorIndex + 1 });
    }
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
  saveCompany = () => {
    const { identity } = this.context.params;
    const { companyName, country, timezone, token } = this.state;
    this.props.validate((error) => {
      if (!error) {
        const companyInfo = {
          name: companyName,
          country,
          timezone,
          token,
          companyId: this.props.companyDetail.companyId,
          carrierId: identity,
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
        executeAction(updateProfile, companyInfo);
      }
    });
  }
  updateCompany = () => {
    const { identity } = this.context.params;
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
          carrierId: identity,
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
        executeAction(updateCompany, companyInfo);
      }
    });
  }
  isChecked = (value) => {
    if (this.state.capabilitiesChecked) {
      return this.state.capabilitiesChecked.indexOf(value) !== -1;
    }
    return null;
  }
  handleCloseErrorDialog = () => {
    this.setState({ errorDialogOpened: false });
  }
  handleCloseSmscBindingDialog = () => {
    const { smsc, smscValues } = this.getClosingSmscDialogState();
    smsc.selectedBindingIndex = null;
    this.setState({ smsc, smscValues });
  }
  handleOpenSmscBindingDialog = (index = null) => {
    // update the smsc state
    const smsc = this.state.smsc;
    smsc.dialogOpened = true;
    smsc.selectedBindingIndex = index;

    const smscValues = this.state.smscValues;
    // set the dialog values
    if (index !== null) {
      smscValues.binding = smsc.bindings[index];
    }
    this.setState({ smsc, smscValues });
  }
  handleAddSmscBinding = (obj) => {
    this.props.validate(SMSC_DATA_ID.BINDING, err => {
      // if both input values are valid
      if (!err) {
        const { smsc, smscValues } = this.getClosingSmscDialogState();
        smsc.bindings.push(_.clone(obj));
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
    const { smsc, smscValues } = this.getClosingSmscDialogState();
    const target = smsc.bindings[index];
    target.ip = obj.ip;
    target.port = obj.port;
    smsc.selectedBindingIndex = null;
    this.setState({ smsc, smscValues });
    this.props.validate(SMSC_DATA_ID.BINDINGS);
  }
  renderArrow = (direction) => {
    // SystemError Oject's length > 1,will render arrow
    if (this.props.systemErrors.length > 1) {
      return (
        <div className="small-2 columns" onClick={() => this.handleSystemErrorChange(direction)}>
          <Icon symbol={direction} />
        </div>
      );
    }
    return null;
  }
  renderSmscBindingDetails() {
    const {
      smsc: { dialogOpened, bindings, selectedBindingIndex },
      smscValues: { binding },
    } = this.state;
    const { getValidationMessages, isValid, smscSettingDisabled } = this.props;
    if (!dialogOpened) {
      return (
      <div className="row">
        <div className="large-10 columns">
          <label>
            <FormattedMessage id="smscBinding" defaultMessage="SMSC Binding" />:
          </label>
        </div>
        <div className="large-14 columns">
        <div className={classNames('company-smsc-setting__link', { disabled: smscSettingDisabled }) }
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
            disabled={smscSettingDisabled}
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
    const { intl: { formatMessage } } = this.props;
    const formatIntlOptionMethod = formatIntlOption.bind(null, formatMessage);
    const companyProfilePanel = (
      <Panel key="companyProfile" header={formatMessage(MESSAGES.companyProfile)} >
        <CompanyProfileInfo
          carrierId={this.props.companyDetail.carrierId}
          chargingRateCarrierId={this.props.companyDetail.carrierId}
          companyCode={this.state.companyCode}
          companyType={this.state.companyType}
          paymentType={this.state.paymentType}
          onCompanyCodeChange={this.onCompanyCodeChange}
          onCompanyTypeChange={this.onCompanyTypeChange}
          onPaymentTypeChange={this.onPaymentTypeChange}
          companyTypeOption={_.map(COMPANY_OPTION, formatIntlOptionMethod)}
          paymentTypeOption={_.map(PAYMENT_OPTION, formatIntlOptionMethod)}
          disabled={this.props.profileDisabled}
          validateField={this.validateField}
          status={this.props.companyDetail.status}
          errors={this.state.validationErrors}
          handleOpenErrorDialog={this.handleOpenErrorDialog}
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
          disabled={this.props.descriptionDisabled}
          validateField={this.validateField}
          errors={this.state.validationErrors}
        />
      </Panel>
    );
    const companyCapabilitiesPanel = (
      <Panel key="companyCapabilities" header={formatMessage(MESSAGES.companyCapabilities)} >
        <CompanyCapabilities
          capabilities={CAPABILITIES}
          onCapabilitiesChange={this.onCapabilitiesChange}
          capabilitiesChecked={this.state.capabilitiesChecked}
          disabled={this.props.capabilitiesDisabled}
          isChecked={this.isChecked}
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
          disabled={this.props.smscSettingDisabled}
        >
          {this.renderSmscBindingDetails()}
        </SmscSetting>
      </Panel>
    );
    const panel = [companyProfilePanel, companyDescriptionPanel, companyCapabilitiesPanel];

    // show the panel when having capability im to sms and sms verfication
    if (_.includes(this.state.capabilitiesChecked, 'im.im-to-sms') ||
     _.includes(this.state.capabilitiesChecked, 'verification.sms')) {
      panel.push(smscSettingPanel);
    }
    return panel;
  }
  render() {
    const { intl: { formatMessage }, systemErrors } = this.props;
    const { identity } = this.context.params;
    const { status } = this.props.companyDetail;
    const currentErrorIndex = this.state.currentErrorIndex;

    return (
      <div className="company__new-profile">
      {
        // when taskError is not empty, errorDialog will be rendered
        !_.isEmpty(systemErrors) && this.state.errorDialogOpened ?
        <CommonDialog
          isOpen={this.state.errorDialogOpened}
          onConfirm={this.handleCloseErrorDialog}
          confirmLabel={formatMessage(i18nMessages.ok)}
          dialogHeader={formatMessage(MESSAGES[systemErrors[currentErrorIndex].name])}
          isMultipleError={systemErrors.length > 1}
        >
          <div className="row">
            {this.renderArrow(PREVIOUS)}
            <div className={classNames({ 'small-20 columns': systemErrors.length > 1 }) }>
              <div className="dialog__message">
                <span>
                {formatMessage(MESSAGES[`${systemErrors[currentErrorIndex].name}Description`])}
                </span>
              </div>
              <Collapse accordion={false}>
                <Panel header={formatMessage(MESSAGES.details)} >
                  <div>
                  {systemErrors[currentErrorIndex].message}
                  </div>
                </Panel>
              </Collapse>
            </div>
            {this.renderArrow(NEXT)}
          </div>
        </CommonDialog> : null
      }
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
          <Permit permission={permission(RESOURCE.COMPANY, ACTION.UPDATE)}>
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
              disabled={status === 'IN_PROGRESS' }
              onClick={
                status === 'ERROR' ?
                this.updateCompany :
                this.saveCompany
              }
            >
            {
              status === 'ERROR' ?
              <FormattedMessage
                id="retry"
                defaultMessage="Retry"
              /> :
              <FormattedMessage
                id="save"
                defaultMessage="Save"
              />
            }
            </button>
          </Permit> :
          // display when the component doesn't receive props from store
          null
        }
      </div>
        <Collapse accordion={false} defaultActiveKey="companyProfile">
        {this.renderPanel()}
        </Collapse>
      </div>
    );
  }
}

CompanyEditForm.propTypes = {
  companyDetail: PropTypes.shape({
    companyCode: PropTypes.string,
    companyName: PropTypes.string,
    companyType: PropTypes.string,
    paymentType: PropTypes.string,
    status: PropTypes.string,
    carrierId: PropTypes.string,
    id: PropTypes.string,
    companyId: PropTypes.string,
    country: PropTypes.string,
    timezone: PropTypes.string,
    resellerCarrierId: PropTypes.string,
    resellerCompanyId: PropTypes.string,
    capabilities: PropTypes.array,
    preset: PropTypes.object,
  }),
  profileDisabled: PropTypes.shape({
    companyCode: PropTypes.bool,
    companyType: PropTypes.bool,
    paymentType: PropTypes.bool,
  }),
  descriptionDisabled: PropTypes.bool,
  capabilitiesDisabled: PropTypes.bool,
  smscSettingDisabled: PropTypes.bool,
  companyToken: PropTypes.number,
  systemErrors: PropTypes.arrayOf(PropTypes.object),
  userErrors: PropTypes.arrayOf(PropTypes.object),
};

CompanyEditForm = injectIntl(injectJoiValidation(CompanyEditForm));

CompanyEditForm = connectToStores(CompanyEditForm, [CompanyStore], (context) => ({
  companyDetail: context.getStore(CompanyStore).getCompanyDetail(),
  profileDisabled: context.getStore(CompanyStore).getProfileDisabled(),
  descriptionDisabled: context.getStore(CompanyStore).getDescriptionDisabled(),
  capabilitiesDisabled: context.getStore(CompanyStore).getCapabilitiesDisabled(),
  smscSettingDisabled: context.getStore(CompanyStore).getSmscSettingDisabled(),
  companyToken: context.getStore(CompanyStore).getCompanyToken(),
  systemErrors: context.getStore(CompanyStore).getSystemErrors(),
  userErrors: context.getStore(CompanyStore).getUserErrors(),
}));

export default CompanyEditForm;
