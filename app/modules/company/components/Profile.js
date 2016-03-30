import _ from 'lodash';
import React from 'react';
import { FluxibleMixin } from 'fluxible-addons-react';
import ValidationMixin from 'react-validation-mixin';

import createProfile from '../actions/createCompany';
import updateProfile from '../actions/updateProfile';
import fetchParentCompanies from '../actions/fetchParentCompanies';

import Tooltip from 'rc-tooltip';
import TopBar from './TopBar';
import BasicInformation from './BasicInformation';
import Contacts from './Contacts';

import CompanyStore from '../stores/CompanyStore';

import config from './../../../main/config';

const { inputDateFormat: DATE_FORMAT } = config;

const CompanyProfile = React.createClass({
  contextTypes: {
    router: React.PropTypes.func.isRequired,
    executeAction: React.PropTypes.func.isRequired,
  },

  mixins: [FluxibleMixin, ValidationMixin],

  statics: {
    storeListeners: [CompanyStore],
  },

  // expose from ValidationMixin
  validatorTypes() {
    return _.reduce(this.refs, function (rules, component) {
      _.merge(rules, _.isFunction(component.getValidatorTypes) && component.getValidatorTypes());
      return rules;
    }, {});
  },

  // expose from ValidationMixin
  getValidatorData() {
    return _.reduce(this.refs, function (rules, component) {
      _.merge(rules, _.isFunction(component.getValidatorData) && component.getValidatorData());
      return rules;
    }, {});
  },

  getInitialState() {
    return this.getStateFromStores();
  },

  getStateFromStores() {
    const { carrierId } = this.context.router.getCurrentParams();

    if (carrierId) {
      return this.getStore(CompanyStore).getCompanyByCarrierId(carrierId);
    }

    return this.getStore(CompanyStore).getNewCompany();
  },

  onChange() {
    this.setState(this.getStateFromStores());
  },

  componentWillMount() {
    // too rush to handle lazy loading at this stage
    this.context.executeAction(fetchParentCompanies);
  },

  _handleInputChange(stateName, e) {
    this.setState({ [stateName]: e.target.value || e.target.selected });

    // do validation for SELECT onChange
    // otherwise it would be done onBlur
    if (e.target.tagName === 'SELECT') {
      const inputName = e.target.name;
      this.validate(inputName);
    }
  },

  _handleContactChange(stateName, key, e) {
    this.setState({
      [stateName]: _.assign(this.state[stateName], { [key]: e.target.value }),
    });
  },

  /**
   * @method _handleLogoChange
   * read File Input with File Reader API
   * and put into state
   *
   * @param e {Object} target Input DOM
   */
  _handleLogoChange(e) {
    if (!!e.target.files[0]) {
      const reader = new FileReader();

      reader.onload = () => {
        this.setState({
          logo: reader.result,
        });
      };

      reader.readAsDataURL(e.target.files[0]);
    }
  },

  _handleDateChange(momentDate) {
    this.setState({
      expectedServiceDate: momentDate.format(DATE_FORMAT),
    });
  },

  _handleCountryChange(val) {
    this.setState({
      country: val,
    });
  },

  _handleInputBlur(e) {
    const inputName = e.target.name;
    this.validate(inputName);
  },

  _handleSetReseller(isReseller) {
    this.setState({
      reseller: isReseller,
    });
  },

  _handleSubmit() {
    this.validate(error => {
      // react-validation-mixin will trigger changes in
      // this.state.errors upon this.validate() is called
      // so no error handling is needed
      if (error) return;

      const { carrierId } = this.context.router.getCurrentParams();
      const form = React.findDOMNode(this.refs.companyForm);
      const formData = new FormData(form);

      if (this.state._id) {
        this.context.executeAction(updateProfile, { carrierId, data: formData });
      } else {
        this.context.executeAction(createProfile, { data: formData });
      }
    });
  },

  _renderHelpText(message) {
    return (
      <Tooltip overlay={message}>
        <a href="#" className="field-set--indicator"><span className="icon-error6" /></a>
      </Tooltip>
    );
  },

  render() {
    return (
      <div>
        <TopBar
          _id={this.state._id}
          status={this.state.status}
          hasError={!this.isValid()}
          onSave={this._handleSubmit}
        />
        <form ref="companyForm" encType="multipart/form-data" onSubmit={this._handleSubmit}>
          <If condition={this.state._id}>
            <input type="hidden" name="_id" value={this.state._id} />
          </If>
          <div className="large-15 columns">
            <BasicInformation
                ref="basicInformation"
                parentCompanies={this.getStore(CompanyStore).getParentCompanies()}
                onDataChange={this._handleInputChange}
                onDateChange={this._handleDateChange}
                onCountryChange={this._handleCountryChange}
                onLogoChange={this._handleLogoChange}
                onInputBlur={this._handleInputBlur}
                onSetReseller={this._handleSetReseller}
                getValidationMessages={this.getValidationMessages}
                renderHelpText={this._renderHelpText}
                {...this.state}
              />
          </div>
          <div className="large-9 columns">
            <Contacts
                ref="contacts"
                onDataChange={this._handleContactChange}
                onInputBlur={this._handleInputBlur}
                getValidationMessages={this.getValidationMessages}
                renderHelpText={this._renderHelpText}
                {...this.state}
              />
          </div>
        </form>
      </div>
    );
  },
});

const ProfileTemplate = React.createFactory(CompanyProfile);

export const NewProfile = React.createClass({
  render() {
    return ProfileTemplate();
  },
});

export const EditProfile = React.createClass({
  render() {
    return ProfileTemplate();
  },
});
