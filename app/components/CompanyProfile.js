import React from 'react';
import {FluxibleMixin} from 'fluxible';
import classNames from 'classnames';

import CompanyStore from 'app/stores/CompanyStore';

import InfoBlock from 'app/components/InfoBlock';

var Countries = require('../../../app/data/countries.json');
var Timezones = require('../../../app/data/timezones.json');

var CompanyProfile = React.createClass({
  mixins: [FluxibleMixin],
  statics: {
    storeListeners: [CompanyStore]
  },
  getInitialState: function () {
    let state = this.getStore(CompanyStore).getState();
    let company = state.currentCompany;
    return {
      name: company.name,
      address: company.address,
      carrierId: company.carrierId,
      reseller: company.reseller,
      logo: company.logo,
      accountManager: company.accountManager,
      billCode: company.billCode,
      expectedServiceDate: company.expectedServiceDate,
      categoryID: company.categoryID,
      country: company.country,
      timezone: company.timezone,
      businessContact: company.businessContact || {name: '', phone: '', email: ''},
      technicalContact: company.technicalContact || {name: '', phone: '', email: ''},
      supportContact: company.supportContact || {name: '', phone: '', email: ''}
    };
  },
  onChange: function() {
    let state = this.getStore(CompanyStore).getState();
    let company = state.currentCompany;
    this.setState({
      name: company.name,
      address: company.address,
      carrierId: company.carrierId,
      reseller: company.reseller,
      logo: company.logo,
      accountManager: company.accountManager,
      billCode: company.billCode,
      expectedServiceDate: company.expectedServiceDate,
      categoryID: company.categoryID,
      country: company.country,
      timezone: company.timezone,
      businessContact: company.businessContact || {name: '', phone: '', email: ''},
      technicalContact: company.technicalContact || {name: '', phone: '', email: ''},
      supportContact: company.supportContact || {name: '', phone: '', email: ''}
    });
  },
  _isWhiteLabel: function() {
    return this.state.carrierId.indexOf('.maaii.com') >= 0;
  },
  _isSDK: function() {
    return this.state.carrierId.indexOf('.m800-api.com') >= 0;
  },
  _renderTimezoneOption: function(timezone) {
    return (
      <option value={timezone.value}>{timezone.name}</option>
    )
  },
  _renderCountryOption: function(country) {
    return (
      <option value={country.alpha2}>{country.name}</option>
    );
  },
  render: function() {
    return (
      <div>
        <div className="large-15 columns">
          <div className="contents-panel">
            <div className="row">
              <div className="large-24 columns">
                <div className="contents-panel__title">
                  <h4>basic information</h4>
                </div>
              </div>
              <div className="large-24 columns">
                <div className="contents-panel__logo">
                  i am a logo
                </div>
              </div>
              <div className="large-24 columns">
                <div className="large-9 columns">
                  <label>company name</label>
                </div>
                <div className="large-15 columns">
                  <input type="text" name="company" placeholder="company name" value={this.state.name} />
                </div>
              </div>
              <div className="large-24 columns">
                <div className="large-9 columns">
                  <label>carrier ID</label>
                </div>
                <div className="large-15 columns">
                  <input type="text" name="carrierId" placeholder="company name" value={this.state.carrierId} />
                </div>
              </div>
              <div className="large-24 columns">
                <div className="large-9 columns">
                  <label>company address</label>
                </div>
                <div className="large-15 columns">
                  <textarea name="company-address" value={this.state.address} />
                </div>
              </div>
              <div className="large-24 columns">
                <div className="large-9 columns">
                  <label>company type</label>
                </div>
                <div className="large-15 columns">
                  <ul className="button-switcher">
                    <li>
                      <a className={classNames('button-switcher__button', {active: !this.state.reseller})}>default</a>
                    </li>
                    <li>
                      <a className={classNames('button-switcher__button', {active: this.state.reseller})}>reseller</a>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="large-24 columns">
                <div className="large-9 columns">
                  <label>parent company</label>
                </div>
                <div className="large-15 columns">
                  <select name="parent-company">
                    <option>please select</option>
                  </select>
                </div>
              </div>
              <div className="large-24 columns">
                <div className="large-9 columns">
                  <label>service type</label>
                </div>
                <div className="large-15 columns">
                  <ul className="button-switcher">
                    <li>
                      <a className={classNames('button-switcher__button', {active: this._isWhiteLabel()})}>whitelabel</a>
                    </li>
                    <li>
                      <a className={classNames('button-switcher__button', {active: this._isSDK()})}>sdk</a>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="large-24 columns">
                <div className="large-9 columns">
                  <label>account manager</label>
                </div>
                <div className="large-15 columns">
                  <input type="text" name="account-manager" placeholder="account manager" value={this.state.accountManager} />
                </div>
              </div>
              <div className="large-24 columns">
                <div className="large-9 columns">
                  <label>bill code</label>
                </div>
                <div className="large-15 columns">
                  <input type="text" name="bill-code" placeholder="bill code" value={this.state.billCode} />
                </div>
              </div>
              <div className="large-24 columns">
                <div className="large-9 columns">
                  <label>category ID</label>
                </div>
                <div className="large-15 columns">
                  <input type="text" name="category-id" placeholder="category ID" value={this.state.categoryID} />
                </div>
              </div>
              <div className="large-24 columns">
                <div className="large-9 columns">
                  <label>expected service date</label>
                </div>
                <div className="large-15 columns">
                  <input type="text" name="company" placeholder="expected service date" value={this.state.expectedServiceDate} />
                </div>
              </div>
              <div className="large-24 columns">
                <div className="large-9 columns">
                  <label>country</label>
                </div>
                <div className="large-15 columns">
                  <select name="country" value={this.state.country}>
                    <option>please select</option>
                    {Countries.map(this._renderCountryOption)}
                  </select>
                </div>
              </div>
              <div className="large-24 columns">
                <div className="large-9 columns">
                  <label>timezone</label>
                </div>
                <div className="large-15 columns">
                  <select name="timezone" value={this.state.timezone}>
                    <option>please select</option>
                    {Timezones.map(this._renderTimezoneOption)}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="large-9 columns">
          <div className="contents-panel info-panel">
            <div className="row">
              <div className="large-24 columns">
                <div className="info-panel__header">
                  <h5 className="info-panel__header__title">contacts</h5>
                </div>
                <InfoBlock title="business contact">
                  <div className="large-24 columns">
                    <div className="row">
                      <div className="large-9 columns">
                        <label>name</label>
                      </div>
                      <div className="large-15 columns">
                        <input name="bc-name" value={this.state.businessContact.name} />
                      </div>
                    </div>
                  </div>
                  <div className="large-24 columns">
                    <div className="row">
                      <div className="large-9 columns">
                        <label>phone</label>
                      </div>
                      <div className="large-15 columns">
                        <input name="bc-phone" value={this.state.businessContact.phone} />
                      </div>
                    </div>
                  </div>
                  <div className="large-24 columns">
                    <div className="row">
                      <div className="large-9 columns">
                        <label>email</label>
                      </div>
                      <div className="large-15 columns">
                        <input name="bc-email" value={this.state.businessContact.email} />
                      </div>
                    </div>
                  </div>
                </InfoBlock>
                <InfoBlock title="technical contact">
                  <div className="large-24 columns">
                    <div className="row">
                      <div className="large-9 columns">
                        <label>name</label>
                      </div>
                      <div className="large-15 columns">
                        <input name="tc-name" value={this.state.technicalContact.name} />
                      </div>
                    </div>
                  </div>
                  <div className="large-24 columns">
                    <div className="row">
                      <div className="large-9 columns">
                        <label>phone</label>
                      </div>
                      <div className="large-15 columns">
                        <input name="tc-phone" value={this.state.technicalContact.phone} />
                      </div>
                    </div>
                  </div>
                  <div className="large-24 columns">
                    <div className="row">
                      <div className="large-9 columns">
                        <label>email</label>
                      </div>
                      <div className="large-15 columns">
                        <input name="tc-email" value={this.state.technicalContact.name} />
                      </div>
                    </div>
                  </div>
                </InfoBlock>
                <InfoBlock title="7 x 24 contact">
                  <div className="large-24 columns">
                    <div className="row">
                      <div className="large-9 columns">
                        <label>name</label>
                      </div>
                      <div className="large-15 columns">
                        <input name="sc-name" value={this.state.supportContact.name} />
                      </div>
                    </div>
                  </div>
                  <div className="large-24 columns">
                    <div className="row">
                      <div className="large-9 columns">
                        <label>phone</label>
                      </div>
                      <div className="large-15 columns">
                        <input name="sc-phone" value={this.state.supportContact.name} />
                      </div>
                    </div>
                  </div>
                  <div className="large-24 columns">
                    <div className="row">
                      <div className="large-9 columns">
                        <label>email</label>
                      </div>
                      <div className="large-15 columns">
                        <input name="sc-email" value={this.state.supportContact.name} />
                      </div>
                    </div>
                  </div>
                </InfoBlock>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
});

export default CompanyProfile;
