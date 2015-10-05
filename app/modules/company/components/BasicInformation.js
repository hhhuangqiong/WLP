var debug = require('debug')('app:BasicInformation');

import _ from 'lodash';
import classNames from 'classnames';
import moment from 'moment';
import React, { PropTypes } from 'react';

import Joi from 'joi';

import * as Panel from '../../../main/components/Panel';
import * as InputGroup from '../../../main/components/InputGroup';
import DatePicker from '../../../main/components/DatePicker';
import CountrySelectBox from '../../../main/components/CountrySelectBox';

import config from './../../../main/config';

let { inputDateFormat: DATE_FORMAT } = config;

// determinant of logo image src
const imageDataRegex = /^data:.+\/(.+);base64,(.*)$/;

let Countries = require('../../../data/countries.json');
let Timezones = require('../../../data/timezones.json');

let BasicInformation = React.createClass({
  PropTypes: {
    parentCompanies: PropTypes.array,
    onDataChange: PropTypes.func.isRequired,
    onDateChange: PropTypes.func.isRequired,
    onLogoChange: PropTypes.func.isRequired,
    onInputBlur: PropTypes.func.isRequired,
    getValidationMessages: PropTypes.func.isRequired,
    renderHelpText: PropTypes.func.isRequired
  },

  getDefaultProps: function() {
    return {
      parentCompanies: []
    };
  },

  // intend to expose this function to parent
  getValidatorTypes: function() {
    return {
      companyName: Joi.string().max(30).required().label('company name'),

      // cannot verify if the carrierId exists with async func.
      // see: https://github.com/hapijs/joi/issues/631
      carrierId: Joi.string().required().label('carrier ID'),
      address: Joi.string().allow('').max(300).label('address'),
      parentCompany: Joi.string().required().label('parent company'),
      accountManager: Joi.string().allow('').allow(null).max(30).label('account manager'),
      billCode: Joi.string().allow('').allow(null).max(20).label('bill code'),
      refNumber: Joi.string().allow('').allow(null).max(20).label('ref no.'),
      contractNumber: Joi.string().allow('').allow(null).max(20).label('contract no.'),
      categoryId: Joi.string().allow('').allow(null).max(20).label('category ID'),
      country: Joi.string().required().label('country'),
      timezone: Joi.string().required().label('timezone')
    };
  },

  // intend to expose this function to parent
  getValidatorData: function() {
    return {
      companyName: this.props.name,
      carrierId: this.props.carrierId,
      address: this.props.address,
      parentCompany: this.props.parentCompany,
      accountManager: this.props.accountManager,
      billCode: this.props.billCode,
      refNumber: this.props.referenceNumber,
      contractNumber: this.props.contractNumber,
      categoryId: this.props.categoryID,
      country: this.props.country,
      timezone: this.props.timezone
    };
  },

  /**
   * @method _getServiceType
   *
   *
   * @param carrierId
   * @returns {string}
   */
  _getServiceType: function(carrierId) {
    return carrierId && carrierId.indexOf('.m800-api.com') > -1 ? 'sdk' : 'wl';
  },

  /**
   * @method _isWhiteLabel
   * check if the Company is WL
   *
   * @returns {boolean} isWhiteLabel
   */
  _isWhiteLabel: function(carrierId) {
    return this._getServiceType(carrierId) === 'wl';
  },

  /**
   * @method _isSDK
   * check if the Company is SDK
   *
   * @returns {boolean} isSDK
   */
  _isSDK: function(carrierId) {
    return this._getServiceType(carrierId) === 'sdk';
  },

  /**
   * @method _handleClickOnLogo
   * trigger opening OS file finder by clicking on Logo image
   */
  _handleClickOnLogo: function() {
    React.findDOMNode(this.refs.logoInput).click();
  },

  _renderParentCompanyOption: function(company) {
    return (
      <option value={company._id}>{company.name}</option>
    );
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
    let logo;

    if (this.props.logo) {
      logo = !this.props.logo.match(imageDataRegex) ? `/data/${this.props.logo}` : this.props.logo;
    }

    return (
      <p className="text-center">
        <If condition={this.props.logo}>
          <img src={logo} onClick={this._handleClickOnLogo} />
        <Else />
          <span className="icon-upload" onClick={this._handleClickOnLogo}></span>
        </If>
      </p>
    );
  },

  render: function() {
    return (
      <Panel.Wrapper>
        <Panel.Header title="basic information" />
        <Panel.Body>
          <div className="row">
            <div className="panel__logo">
              {this._renderLogoImage()}
              <input ref="logoInput" className="hide" type="file" name="logo" onChange={this.props.onLogoChange} />
            </div>
          </div>
          <InputGroup.Row>
            <InputGroup.Label for="companyName">company name*</InputGroup.Label>
            <InputGroup.Input>
              <input
                  className="radius"
                  type="text"
                  name="companyName"
                  placeholder="company name"
                  value={this.props.name}
                  onChange={_.bindKey(this.props, 'onDataChange', 'name')}
                  onBlur={this.props.onInputBlur}
                />
              {this.props.getValidationMessages('companyName').map(this.props.renderHelpText)}
            </InputGroup.Input>
          </InputGroup.Row>
          <InputGroup.Row>
            <InputGroup.Label for="carrierId">carrier ID*</InputGroup.Label>
            <InputGroup.Input>
              <input
                  className="radius"
                  type="text"
                  name="carrierId"
                  placeholder="yourcompany.maaii.com"
                  value={this.props.carrierId}
                  onChange={_.bindKey(this.props, 'onDataChange', 'carrierId')}
                  onBlur={this.props.onInputBlur}
                />
              {this.props.getValidationMessages('carrierId').map(this.props.renderHelpText)}
            </InputGroup.Input>
          </InputGroup.Row>
          <InputGroup.Row>
            <InputGroup.Label for="address">company address</InputGroup.Label>
            <InputGroup.Input>
              <textarea
                  className="radius"
                  name="address"
                  value={this.props.address}
                  placeholder="unit, building, street &#10;city, region &#10;country, code"
                  onChange={_.bindKey(this.props, 'onDataChange', 'address')}
                  onBlur={this.props.onInputBlur}
                />
              {this.props.getValidationMessages('address').map(this.props.renderHelpText)}
            </InputGroup.Input>
          </InputGroup.Row>
          <InputGroup.Row>
            <InputGroup.Label>company type*</InputGroup.Label>
            <InputGroup.Input>
              <ul className="button-group round even-2">
                <li>
                  <a
                    className={classNames('button', {active: !this.props.reseller})}
                    onClick={_.bindKey(this.props, 'onSetReseller', false)}
                    >
                    default
                  </a>
                  <input className="hide" type="radio" name="reseller" value="0" checked={!this.props.reseller} readOnly />
                </li>
                <li>
                  <a
                    className={classNames('button', {active: this.props.reseller})}
                    onClick={_.bindKey(this.props, 'onSetReseller', true)}
                    >
                    reseller
                  </a>
                  <input className="hide" type="radio" name="reseller" value="1" checked={this.props.reseller} readOnly />
                </li>
              </ul>
            </InputGroup.Input>
          </InputGroup.Row>
          <InputGroup.Row>
            <InputGroup.Label for="parentCompany">parent company*</InputGroup.Label>
            <InputGroup.Input>
              <select className="radius" name="parentCompany" value={this.props.parentCompany} onChange={_.bindKey(this.props, 'onDataChange', 'parentCompany')} onBlur={this.props.onInputBlur}>
                <option value="">please select</option>
                {this.props.parentCompanies.map(this._renderParentCompanyOption)}
              </select>
              {this.props.getValidationMessages('parentCompany').map(this.props.renderHelpText)}
            </InputGroup.Input>
          </InputGroup.Row>
          <InputGroup.Row>
            <InputGroup.Label>service type*</InputGroup.Label>
            <InputGroup.Input>
              <ul className="button-group round even-2">
                <li>
                  <a className={classNames('button', {active: this._isWhiteLabel(this.props.carrierId)})}>whitelabel</a>
                </li>
                <li>
                  <a className={classNames('button', {active: this._isSDK(this.props.carrierId)})}>sdk</a>
                </li>
              </ul>
            </InputGroup.Input>
          </InputGroup.Row>
          <InputGroup.Row>
            <InputGroup.Label for="accountManager">account manager</InputGroup.Label>
            <InputGroup.Input>
              <input
                  className="radius"
                  type="text"
                  name="accountManager"
                  placeholder="account manager"
                  value={this.props.accountManager}
                  onChange={_.bindKey(this.props, 'onDataChange', 'accountManager')}
                  onBlur={this.props.onInputBlur}
                />
              {this.props.getValidationMessages('accountManager').map(this.props.renderHelpText)}
            </InputGroup.Input>
          </InputGroup.Row>
          <InputGroup.Row>
            <InputGroup.Label for="billCode">bill code</InputGroup.Label>
            <InputGroup.Input>
              <input
                  className="radius"
                  type="text"
                  name="billCode"
                  placeholder="bill code"
                  value={this.props.billCode}
                  onChange={_.bindKey(this.props, 'onDataChange', 'billCode')}
                  onBlur={this.props.onInputBlur}
                />
              {this.props.getValidationMessages('billCode').map(this.props.renderHelpText)}
            </InputGroup.Input>
          </InputGroup.Row>
          <InputGroup.Row>
            <InputGroup.Label for="categoryId">category ID</InputGroup.Label>
            <InputGroup.Input>
              <input
                  className="radius"
                  type="text"
                  name="categoryId"
                  placeholder="category ID"
                  value={this.props.categoryID}
                  onChange={_.bindKey(this.props, 'onDataChange', 'categoryID')}
                  onBlur={this.props.onInputBlur}
                />
              {this.props.getValidationMessages('categoryId').map(this.props.renderHelpText)}
            </InputGroup.Input>
          </InputGroup.Row>
          <InputGroup.Row>
            <InputGroup.Label for="expectedServiceDate">expected service date</InputGroup.Label>
            <InputGroup.Input>
              <DatePicker withIcon={true} type="button" selectedDate={this.props.expectedServiceDate ? moment(this.props.expectedServiceDate).format(DATE_FORMAT) : moment().format(DATE_FORMAT)} onChange={this.props.onDateChange} />
              <input
                  className="radius"
                  type="hidden"
                  name="expectedServiceDate"
                  placeholder="expected service date"
                  value={this.props.expectedServiceDate}
                  onChange={_.bindKey(this.props, 'onDataChange', 'expectedServiceDate')}
                  onBlur={this._handleInputBlur}
                />
              {this.props.getValidationMessages('expectedServiceDate').map(this.props.renderHelpText)}
            </InputGroup.Input>
          </InputGroup.Row>
          <InputGroup.Row>
            <InputGroup.Label for="country">country*</InputGroup.Label>
            <InputGroup.Input>
              <CountrySelectBox
                  name="country"
                  value={this.props.country}
                  searchable={true}
                  showFlag={true}
                  showText={true}
                  onChange={this.props.onCountryChange}
              />
              {this.props.getValidationMessages('country').map(this.props.renderHelpText)}
            </InputGroup.Input>
          </InputGroup.Row>
          <InputGroup.Row>
            <InputGroup.Label for="timezone">timezone*</InputGroup.Label>
            <InputGroup.Input>
              <select className="radius" name="timezone" value={this.props.timezone} onChange={_.bindKey(this.props, 'onDataChange', 'timezone')} onBlur={this.props.onInputBlur}>
                <option>please select</option>
                {Timezones.map(this._renderTimezoneOption)}
              </select>
              {this.props.getValidationMessages('timezone').map(this.props.renderHelpText)}
            </InputGroup.Input>
          </InputGroup.Row>
        </Panel.Body>
      </Panel.Wrapper>
    )
  }
});

export default BasicInformation;
