var debug = require('debug')('app:Profile');

import _ from 'lodash';
import classNames from 'classnames';
import moment from 'moment';

import React from 'react';
import FluxibleMixin from 'fluxible/addons/FluxibleMixin';

import Joi from 'joi';
import ValidationMixin from 'react-validation-mixin';

import createProfile from '../actions/createCompany';
import updateProfile from '../actions/updateProfile';
import fetchParentCompanies from '../actions/fetchParentCompanies';

import Tooltip from 'rc-tooltip'
import TopBar from './TopBar';
import BasicInformation from './BasicInformation';
import Contacts from './Contacts';

import CompanyStore from '../stores/CompanyStore';

import config from './../../../main/config';

let { inputDateFormat: DATE_FORMAT } = config;

let CompanyProfile = React.createClass({
  contextTypes: {
    router: React.PropTypes.func.isRequired,
    executeAction: React.PropTypes.func.isRequired
  },

  mixins: [FluxibleMixin, ValidationMixin],

  statics: {
    storeListeners: [CompanyStore]
  },

  // expose from ValidationMixin
  validatorTypes: function() {
    return _.reduce(this.refs, function(rules, component) {
      _.merge(rules, _.isFunction(component.getValidatorTypes) && component.getValidatorTypes());
      return rules;
    }, {});
  },

  // expose from ValidationMixin
  getValidatorData: function() {
    return _.reduce(this.refs, function(rules, component) {
      _.merge(rules, _.isFunction(component.getValidatorData) && component.getValidatorData());
      return rules;
    }, {});
  },

  getInitialState: function() {
    return this.getStateFromStores();
  },

  getStateFromStores: function() {
    let { carrierId } = this.context.router.getCurrentParams();

    if (carrierId) {
      return this.getStore(CompanyStore).getCompanyByCarrierId(carrierId)
    } else {
      return this.getStore(CompanyStore).getNewCompany();
    }
  },

  onChange: function() {
    this.setState(this.getStateFromStores());
  },

  componentWillMount: function() {
    // too rush to handle lazy loading at this stage
    this.context.executeAction(fetchParentCompanies);
  },

  _handleInputChange: function(stateName, e) {
    this.setState({[stateName]: e.target.value || e.target.selected});

    // do validation for SELECT onChange
    // otherwise it would be done onBlur
    if (e.target.tagName === 'SELECT') {
      let inputName = e.target.name;
      this.validate(inputName);
    }
  },

  _handleContactChange: function(stateName, key, e) {
    this.setState({
      [stateName]: _.assign(this.state[stateName], {[key]: e.target.value})
    });
  },

  /**
   * @method _handleLogoChange
   * read File Input with File Reader API
   * and put into state
   *
   * @param e {Object} target Input DOM
   */
  _handleLogoChange: function(e) {
    if (!!e.target.files[0]) {
      var reader = new FileReader();

      reader.onload = (e) => {
        this.setState({
          logo: reader.result
        });
      };

      reader.readAsDataURL(e.target.files[0]);
    }
  },

  _handleDateChange: function(momentDate) {
    this.setState({
      expectedServiceDate: momentDate.format(DATE_FORMAT)
    });
  },

  _handleCountryChange: function(val) {;
    this.setState({
      country: val
    });
  },

  _handleInputBlur: function(e) {
    let inputName = e.target.name;
    this.validate(inputName);
  },

  _handleSetReseller: function(isReseller) {
    this.setState({
      reseller: isReseller
    });
  },

  _handleSubmit: function() {
    this.validate((error)=> {
      // react-validation-mixin will trigger changes in
      // this.state.errors upon this.validate() is called
      // so no error handling is needed
      if (error)
        return;

      let { carrierId } = this.context.router.getCurrentParams();

      let form = React.findDOMNode(this.refs.companyForm);
      let formData = new FormData(form);

      if (this.state._id) {
        this.context.executeAction(updateProfile, { carrierId, data: formData });
      } else {
        this.context.executeAction(createProfile, { data: formData });
      }
    });
  },

  _renderHelpText: function(message) {
    return (
      <Tooltip overlay={message}>
        <a href="#" className="field-set--indicator"><span className="icon-error6" /></a>
      </Tooltip>
    );
  },

  render: function() {
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
    )
  }
});

let ProfileTemplate = React.createFactory(CompanyProfile);

export let NewProfile = React.createClass({
  render: function() {
    return ProfileTemplate();
  }
});

export let EditProfile = React.createClass({
  render: function() {
    return ProfileTemplate();
  }
});
