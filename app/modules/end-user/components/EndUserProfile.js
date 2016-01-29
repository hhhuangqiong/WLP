import _ from 'lodash';
import {concurrent} from 'contra';
import moment from 'moment';

import React from 'react';
import FluxibleMixin from 'fluxible/addons/FluxibleMixin';
import classNames from 'classnames';

import AuthMixin from '../../../utils/AuthMixin';

import EndUserStore from '../stores/EndUserStore';

import fetchWallet from '../actions/fetchWallet';
import deactivateEndUser from '../actions/deactivateEndUser';
import reactivateEndUser from '../actions/reactivateEndUser';

import InfoPanel from './InfoPanel';
import Section from './InfoBlock';
import * as Accordion from '../../../main/components/Accordion';
import * as Panel from '../../../main/components/Panel';
import WalletInfoItem from './WalletInfoItem';
import Item from './InfoItem';

const { displayDateFormat: DATE_FORMAT } = require('./../../../main/config');
const Countries = require('../../../data/countries.json');

const EMPTY_STRING = 'N/A';

var EndUserProfile = React.createClass({
  contextTypes: {
    executeAction: React.PropTypes.func.isRequired,
    router: React.PropTypes.func.isRequired
  },

  mixins: [AuthMixin],

  getParams: function() {
    let { identity: carrierId } = this.context.router.getCurrentParams();
    let username = this.props.user.userDetails.username;

    return { carrierId, username };
  },

  handleSuspendClick: function() {
    this.context.executeAction(deactivateEndUser, this.getParams());
  },

  handleReactivateClick: function() {
    this.context.executeAction(reactivateEndUser, this.getParams());
  },

  handleRefreshButtonClick: function() {
    this.context.executeAction(fetchWallet, this.getParams());
  },

  checkPlatformOS: function(platform, matchOS) {
    return (platform) ? platform.toLowerCase() === matchOS : false;
  },

  renderWalletPanel: function() {
    let wallets = (
      <Accordion.Navigation title="Wallet Info">
        <div className="error text-center">
          <div className="error-description full-width">
            <i className="error-icon icon-error3" />
            <span className="error-message">Wallet info unavailable</span>
          </div>
          <div className="error-button" onClick={this.handleRefreshButtonClick}>
            <i className="icon-refresh" />
          </div>
        </div>
      </Accordion.Navigation>
    );

    if (this.props.user.wallets && this.props.user.wallets.length > 0) {
      // create an overview wallet
      let overviewWallet = {
        walletType: 'overview',
        // assume the currency are consistent between free & paid wallet
        currency: _.first(this.props.user.wallets).currency,
        balance: 0
      };

      this.props.user.wallets.map((wallet) => {
        overviewWallet.balance += +wallet.balance;
        // the business logic saying that the expiry date
        // would always be the same, pick the latter one
        // in case it comes with difference
        overviewWallet.expiryDate = overviewWallet.expiryDate ? wallet.expiryDate : (
          moment(overviewWallet.expiryDate).isAfter(moment(wallet.expiryDate)) ? overviewWallet.expiryDate : wallet.expiryDate
        );
      });

      wallets = (
        <Accordion.Navigation title="Wallet Info">
          <WalletInfoItem wallet={overviewWallet} />
          {this.props.user.wallets.map((wallet) => {
            return (
              <WalletInfoItem wallet={wallet} />
            );
          })}
        </Accordion.Navigation>
      );
    }

    return wallets;
  },

  renderAccountPanel: function() {
    let country = {
      name: EMPTY_STRING,
      alpha2: EMPTY_STRING
    };

    if (this.props.user.userDetails.countryCode) {
      let countryCode = this.props.user.userDetails.countryCode.toLowerCase();
      country = _.find(Countries, (c) => {
        return c.alpha2.toLowerCase() === countryCode;
      }) || country;
    }

    let creationDate = moment(this.props.user.userDetails.creationDate).format(DATE_FORMAT);

    return (
      <Accordion.Navigation title="Account Info" hasIndicator verified={this.props.user.userDetails.verified}>
        <Item label="Created Time">{creationDate}</Item>
        <Item label="Verified" capitalize>
          <If condition={this.props.user.userDetails.verified}>
            <span className="verified">verified</span>
            <Else />
            <span className="unverified">unverified</span>
          </If>
        </Item>
        <Item label="Country">
          <div className="country-label">
            <div className="flag__container left">
              <span className={classNames('flag--' + country.alpha2.toLowerCase(), 'left')}/>
            </div>
            {country.name}
          </div>
        </Item>
        <Item label="Username">{this.props.user.userDetails.jid}</Item>
        <Item label="Email">{this.props.user.userDetails.email || EMPTY_STRING}</Item>
        <Item label="Pin">{this.props.user.userDetails.pin || EMPTY_STRING}</Item>
        <Item label="Date of Birth">{this.props.user.userDetails.birthDate || EMPTY_STRING}</Item>
        <Item label="Gender" capitalize>
          <span className="gender-label">
            <i
              className={classNames({'icon-male': this.props.user.userDetails.gender === 'male', 'icon-female': this.props.user.userDetails.gender === 'female'})}/>
            {this.props.user.userDetails.gender || EMPTY_STRING}
          </span>
        </Item>
      </Accordion.Navigation>
    );
  },

  renderDevicePanel: function() {
    return this.props.user.userDetails.devices.map((device) => {
      return (
        <Accordion.Navigation title="App Info">
          <Item label="Device">
            <span className="device-label">
              <i className={classNames({'icon-apple': this.checkPlatformOS(device.platform, 'ios') }, {'icon-android': this.checkPlatformOS(device.platform, 'android') })} />
              {device.platform}
            </span>
          </Item>
          <Item label="Version">
            <If condition={device.appVersionNumber}>
              <span>v{device.appVersionNumber}</span>
            <Else />
              <span>{EMPTY_STRING}</span>
            </If>
          </Item>
          <Item label="Language">{device.appLanguage}</Item>
        </Accordion.Navigation>
      );
    });
  },

  render: function() {
    return (
      <If condition={this.props.user && this.props.user.userDetails}>
        <Panel.Wrapper addOn>
          <Panel.Header title={this.props.user.userDetails.displayName}/>
          <Panel.Body>
            <Accordion.Wrapper offsetMargin>
              {this.renderWalletPanel()}
              {this.renderAccountPanel()}
              {this.renderDevicePanel()}
            </Accordion.Wrapper>

            <If condition={this.props.user.userDetails.verified}>
              <div className="enduser-profile__control text-center">
                <div className="enduser-profile__control__row">
                  { /*

                  // Temporarily Revoke for v1.5.x

                  <If condition={this.props.user.userDetails.accountStatus.toLowerCase() === 'active'}>
                    <button className="round" onClick={this.handleSuspendClick}>suspend</button>
                  <Else />
                    <button className="round" onClick={this.handleReactivateClick}>reactivate</button>
                  </If>
                  */ }
                </div>
              </div>
            </If>
          </Panel.Body>
        </Panel.Wrapper>
      </If>
    );
  }
});

export default EndUserProfile;
