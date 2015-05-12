import _ from 'lodash';
import React from 'react';
import {FluxibleMixin} from 'fluxible';
import classNames from 'classnames';
import request from 'superagent';

import CompanyStore from '../stores/CompanyStore';

import InfoBlock from './InfoBlock';

var Countries = require('../data/countries.json');
var Timezones = require('../data/timezones.json');

// determinant of logo image src
const imageDataRegex = /^data:.+\/(.+);base64,(.*)$/;

const newContactObject = {name: '', phone: '', email: ''};

var CompanyProfile = React.createClass({
  contextTypes: {
    executeAction: React.PropTypes.func.isRequired
  },
  getInitialState: function () {
    return {
      errors: null,
      _id: this.props._id || null,
      name: this.props.name || '',
      address: this.props.address || '',
      carrierId: this.props.carrierId || '',
      reseller: this.props.reseller || false,
      logo: this.props.logo || null,
      accountManager: this.props.accountManager || '',
      billCode: this.props.billCode || '',
      expectedServiceDate: this.props.expectedServiceDate || '',
      categoryID: this.props.categoryID || '',
      country: this.props.country || '',
      timezone: this.props.timezone || '',
      serviceConfig: this.props.serviceConfig || {},
      businessContact: this.props.businessContact || newContactObject,
      technicalContact: this.props.technicalContact || newContactObject,
      supportContact: this.props.supportContact || newContactObject
    };
  },
  componentWillReceiveProps: function(nextProps) {
    // errors should always be null upon selecting another company
    // it applies only with difference in carrierId
    // this function will fire upon any change in parent state
    // so carrierId checking is a MUST
    if (this.props.carrierId != nextProps.carrierId) {
      this.setState({
        errors: null,
        _id: nextProps._id || null,
        name: nextProps.name || '',
        address: nextProps.address || '',
        carrierId: nextProps.carrierId || '',
        reseller: nextProps.reseller || false,
        logo: nextProps.logo || null,
        accountManager: nextProps.accountManager || '',
        billCode: nextProps.billCode || '',
        expectedServiceDate: nextProps.expectedServiceDate || '',
        categoryID: nextProps.categoryID || '',
        country: nextProps.country || '',
        timezone: nextProps.timezone || '',
        serviceConfig: nextProps.serviceConfig || {},
        businessContact: nextProps.businessContact || newContactObject,
        technicalContact: nextProps.technicalContact || newContactObject,
        supportContact: nextProps.supportContact || newContactObject
      });
    }
  },
  /**
   * check if the Company is WL
   *
   * @returns {boolean} isWhiteLabel
   */
  isWhiteLabel: function() {
    return !!this.state.carrierId && this.state.carrierId.indexOf('.maaii.com') > -1;
  },
  /**
   * check if the Company is SDK
   *
   * @returns {boolean} isSDK
   */
  isSDK: function() {
    return !!this.state.carrierId && this.state.carrierId.indexOf('.m800-api.com') > -1;
  },
  /**
   * handle input values changes for <input /> and <select />
   *
   * @param stateName {String} state name
   * @param e {Object} target DOM
   * @private
   */
  _handleInputChange: function(stateName, e) {
    this.setState({[stateName]: e.target.value || e.target.selected});
  },
  _handleContactChange: function(stateName, key, e) {
    this.setState({
      [stateName]: _.merge(this.state[stateName], {[key]: e.target.value})
    });
  },
  /**
   * trigger opening file selection window by clicking on Logo image
   *
   * @private
   */
  _handleClickOnLogo: function() {
    React.findDOMNode(this.refs.logoInput).click();
  },
  /**
   * read File Input with File Reader API
   * and put into state
   *
   * @param e {Object} target DOM
   * @private
   */
  _handleLogoChange: function(e) {
    var reader = new FileReader();
    reader.onload = (e) => {
      this.setState({
        logo: reader.result
      });
    };
    reader.readAsDataURL(e.target.files[0]);
  },
  _handleInputBlur: function() {
    // do validation and return errors if any
    //this.props.onDataChange(['validation error']);
  },
  _handleSetReseller: function(isReseller) {
    this.setState({
      reseller: isReseller
    });
  },
  _renderTimezoneOption: function(timezone) {
    return (
      <option value={timezone.value}>{timezone.name}</option>
    );
  },
  _renderCountryOption: function(country) {
    return (
      <option value={country.alpha2}>{country.name}</option>
    );
  },
  _renderLogoImage: function() {
    if (this.state.logo) {
      let logo = this.state.logo;

      if (!this.state.logo.match(imageDataRegex)) {
        logo = `/data/${this.state.logo}`;
      }

      return (
        <img src={logo} onClick={this._handleClickOnLogo} />
      );
    }
  },
  _renderIdInput: function() {
    if (this.props._id) {
      return (
        <input type="hidden" name="_id" value={this.props._id} />
      );
    };
  },
  render: function() {
    return (
      <form ref="companyFrom" encType="multipart/form-data">
        {this._renderIdInput()}
        <div className="large-15 columns">
          <div className="panel">
            <div className="row">
              <div className="large-24 columns">
                <div className="panel__title">
                  <h4>basic information</h4>
                </div>
                <div className="panel__body">
                  <div className="row">
                    <div className="panel__logo">
                      {this._renderLogoImage()}
                      <input ref="logoInput" className="hide" type="file" name="logo" onChange={this._handleLogoChange} />
                    </div>
                  </div>

                  <div className="row">
                    <div className="large-9 columns">
                      <label>company name</label>
                    </div>
                    <div className="large-15 columns">
                      <input className="radius"
                        type="text" name="name" placeholder="company name"
                        value={this.state.name}
                        onChange={_.bindKey(this, '_handleInputChange', 'name')}
                        onBlur={this._handleInputBlur}
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="large-9 columns">
                      <label>carrier ID</label>
                    </div>
                    <div className="large-15 columns">
                      <input className="radius"
                        type="text" name="carrierId" placeholder="company name"
                        value={this.state.carrierId}
                        onChange={_.bindKey(this, '_handleInputChange', 'carrierId')}
                        onBlur={this._handleCarrierIdBlur}
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="large-9 columns">
                      <label>company address</label>
                    </div>
                    <div className="large-15 columns">
                      <textarea className="radius"
                        name="address"
                        value={this.state.address}
                        onChange={_.bindKey(this, '_handleInputChange', 'address')}
                        onBlur={this._handleInputBlur}
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="large-9 columns">
                      <label>company type</label>
                    </div>
                    <div className="large-15 columns">
                      <ul className="button-switcher">
                        <li>
                          <a
                            className={classNames('button-switcher__button', {active: !this.state.reseller})}
                            onClick={_.bindKey(this, '_handleSetReseller', false)}
                            >
                            default
                          </a>
                          <input className="hide" type="radio" name="reseller" value="0" checked={!this.state.reseller} readOnly />
                        </li>
                        <li>
                          <a
                            className={classNames('button-switcher__button', {active: this.state.reseller})}
                            onClick={_.bindKey(this, '_handleSetReseller', true)}
                            >
                            reseller
                          </a>
                          <input className="hide" type="radio" name="reseller" value="1" checked={this.state.reseller} readOnly />
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="row">
                    <div className="large-9 columns">
                      <label>parent company</label>
                    </div>
                    <div className="large-15 columns">
                      <select className="radius" name="parent-company">
                        <option value="551bbd63003fd58975b12284">m800</option>
                      </select>
                    </div>
                  </div>

                  <div className="row">
                    <div className="large-9 columns">
                      <label>service type</label>
                    </div>
                    <div className="large-15 columns">
                      <ul className="button-switcher">
                        <li>
                          <a className={classNames('button-switcher__button', {active: this.isWhiteLabel()})}>whitelabel</a>
                        </li>
                        <li>
                          <a className={classNames('button-switcher__button', {active: this.isSDK()})}>sdk</a>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="row">
                    <div className="large-9 columns">
                      <label>account manager</label>
                    </div>
                    <div className="large-15 columns">
                      <input className="radius"
                        type="text" name="accountManager" placeholder="account manager"
                        value={this.state.accountManager}
                        onChange={_.bindKey(this, '_handleInputChange', 'accountManager')}
                        onBlur={this._handleInputBlur}
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="large-9 columns">
                      <label>bill code</label>
                    </div>
                    <div className="large-15 columns">
                      <input className="radius"
                        type="text" name="billCode" placeholder="bill code"
                        value={this.state.billCode}
                        onChange={_.bindKey(this, '_handleInputChange', 'billCode')}
                        onBlur={this._handleInputBlur}
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="large-9 columns">
                      <label>category ID</label>
                    </div>
                    <div className="large-15 columns">
                      <input className="radius"
                        type="text" name="categoryID" placeholder="category ID"
                        value={this.state.categoryID}
                        onChange={_.bindKey(this, '_handleInputChange', 'categoryID')}
                        onBlur={this._handleInputBlur}
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="large-9 columns">
                      <label>expected service date</label>
                    </div>
                    <div className="large-15 columns">
                      <input className="radius"
                        type="text" name="expectedServiceDate" placeholder="expected service date"
                        value={this.state.expectedServiceDate}
                        onChange={_.bindKey(this, '_handleInputChange', 'expectedServiceDate')}
                        onBlur={this._handleInputBlur}
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="large-9 columns">
                      <label>country</label>
                    </div>
                    <div className="large-15 columns">
                      <select className="radius" name="country" value={this.state.country} onChange={_.bindKey(this, '_handleInputChange', 'country')}>
                        <option>please select</option>
                        {Countries.map(this._renderCountryOption)}
                      </select>
                    </div>
                  </div>

                  <div className="row">
                    <div className="large-9 columns">
                      <label>timezone</label>
                    </div>
                    <div className="large-15 columns">
                      <select className="radius" name="timezone" value={this.state.timezone} onChange={_.bindKey(this, '_handleInputChange', 'timezone')}>
                        <option>please select</option>
                        {Timezones.map(this._renderTimezoneOption)}
                      </select>
                    </div>
                    </div>
                  </div>
              </div>
            </div>
          </div>
        </div>
        <div className="large-9 columns">
          <div className="panel panel--addon">
            <div className="row">
              <div className="large-24 columns">
                <div className="panel--addon__title">
                  <h6>contacts</h6>
                </div>
                <div className="panel--addon__body">
                  <ul className="accordion">
                    <InfoBlock title="Business contact">
                        <div className="row">
                          <div className="large-9 columns">
                            <label>name</label>
                          </div>
                          <div className="large-15 columns">
                            <input className="radius"
                              type="text" name="bc-name"
                              value={this.state.businessContact.name}
                              onChange={_.bindKey(this, '_handleContactChange', 'businessContact', 'name')}
                              onBlur={this._handleInputBlur} />
                          </div>
                        </div>
                        <div className="row">
                          <div className="large-9 columns">
                            <label>phone</label>
                          </div>
                          <div className="large-15 columns">
                            <input className="radius"
                              type="text" name="bc-phone"
                              value={this.state.businessContact.phone}
                              onChange={_.bindKey(this, '_handleContactChange', 'businessContact', 'phone')}
                              onBlur={this._handleInputBlur} />
                          </div>
                        </div>
                        <div className="row">
                          <div className="large-9 columns">
                            <label>email</label>
                          </div>
                          <div className="large-15 columns">
                            <input className="radius"
                              type="text" name="bc-email"
                              value={this.state.businessContact.email}
                              onChange={_.bindKey(this, '_handleContactChange', 'businessContact', 'email')}
                              onBlur={this._handleInputBlur} />
                          </div>
                        </div>
                    </InfoBlock>
                    <InfoBlock title="Technical contact">
                        <div className="row">
                          <div className="large-9 columns">
                            <label>name</label>
                          </div>
                          <div className="large-15 columns">
                            <input className="radius"
                              type="text" name="tc-name"
                              value={this.state.technicalContact.name}
                              onChange={_.bindKey(this, '_handleContactChange', 'technicalContact', 'name')}
                              onBlur={this._handleInputBlur} />
                          </div>
                        </div>
                        <div className="row">
                          <div className="large-9 columns">
                            <label>phone</label>
                          </div>
                          <div className="large-15 columns">
                            <input className="radius"
                              type="text" name="tc-phone"
                              value={this.state.technicalContact.phone}
                              onChange={_.bindKey(this, '_handleContactChange', 'technicalContact', 'phone')}
                              onBlur={this._handleInputBlur} />
                          </div>
                        </div>
                        <div className="row">
                          <div className="large-9 columns">
                            <label>email</label>
                          </div>
                          <div className="large-15 columns">
                            <input className="radius"
                              type="text" name="tc-email"
                              value={this.state.technicalContact.email}
                              onChange={_.bindKey(this, '_handleContactChange', 'technicalContact', 'email')}
                              onBlur={this._handleInputBlur} />
                          </div>
                      </div>
                    </InfoBlock>
                    <InfoBlock title="7 x 24 contact">
                        <div className="row">
                          <div className="large-9 columns">
                            <label>name</label>
                          </div>
                          <div className="large-15 columns">
                            <input className="radius"
                              type="text" name="sc-name"
                              value={this.state.supportContact.name}
                              onChange={_.bindKey(this, '_handleContactChange', 'supportContact', 'name')}
                              onBlur={this._handleInputBlur} />
                          </div>
                        </div>
                        <div className="row">
                          <div className="large-9 columns">
                            <label>phone</label>
                          </div>
                          <div className="large-15 columns">
                            <input className="radius"
                              type="text" name="sc-phone"
                              value={this.state.supportContact.phone}
                              onChange={_.bindKey(this, '_handleContactChange', 'supportContact', 'phone')}
                              onBlur={this._handleInputBlur} />
                          </div>
                        </div>
                        <div className="row">
                          <div className="large-9 columns">
                            <label>email</label>
                          </div>
                          <div className="large-15 columns">
                            <input className="radius"
                              type="text" name="sc-email"
                              value={this.state.supportContact.email}
                              onChange={_.bindKey(this, '_handleContactChange', 'supportContact', 'email')}
                              onBlur={this._handleInputBlur} />
                          </div>
                      </div>
                    </InfoBlock>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    )
  }
});

export default CompanyProfile;
