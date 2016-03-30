import _ from 'lodash';
import moment from 'moment';

import React, { PropTypes } from 'react';
import classNames from 'classnames';

import fetchWallet from '../actions/fetchWallet';
import deactivateEndUser from '../actions/deactivateEndUser';
import reactivateEndUser from '../actions/reactivateEndUser';

import * as Accordion from '../../../main/components/Accordion';
import * as Panel from '../../../main/components/Panel';
import CountryFlag from '../../../main/components/CountryFlag';

import WalletInfoItem from './WalletInfoItem';
import Item from './InfoItem';

const { displayDateFormat: DATE_FORMAT } = require('./../../../main/config');
import { getCountryName } from '../../../utils/StringFormatter';

const EMPTY_STRING = 'N/A';

const EndUserProfile = React.createClass({
  propTypes: {
    user: PropTypes.shape({
      userDetails: PropTypes.shape({
        username: PropTypes.string.isRequired,
      }),
    }),
  },

  contextTypes: {
    executeAction: React.PropTypes.func.isRequired,
    router: React.PropTypes.func.isRequired,
  },

  getParams() {
    const { identity: carrierId } = this.context.router.getCurrentParams();
    const username = this.props.user.userDetails.username;

    return { carrierId, username };
  },


  renderWalletPanel() {
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
      const overviewWallet = {
        walletType: 'overview',
        // assume the currency are consistent between free & paid wallet
        currency: _.first(this.props.user.wallets).currency,
        balance: 0,
      };

      this.props.user.wallets.map(wallet => {
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

  renderAccountPanel() {
    const creationDate = moment(this.props.user.userDetails.creationDate).format(DATE_FORMAT);
    const countryCode = (this.props.user.userDetails.countryCode || '').toLowerCase();

    return (
      <Accordion.Navigation title="Account Info" hasIndicator verified={this.props.user.userDetails.verified}>
        <Item label="Created Time" className="end-user-info__created-time">{creationDate}</Item>
        <Item label="Verified" capitalize>
          <If condition={this.props.user.userDetails.verified}>
            <span className="verified">verified</span>
            <Else />
            <span className="unverified">unverified</span>
          </If>
        </Item>
        <Item label="Country">
          <div className="country-label">
            <CountryFlag code={countryCode} />
            {getCountryName(countryCode)}
          </div>
        </Item>
        <Item label="Username">{this.props.user.userDetails.jid}</Item>
        <Item label="Email">{this.props.user.userDetails.email || EMPTY_STRING}</Item>
        <Item label="Pin">{this.props.user.userDetails.pin || EMPTY_STRING}</Item>
        <Item label="Date of Birth">{this.props.user.userDetails.birthDate || EMPTY_STRING}</Item>
        <Item label="Gender" capitalize>
          <span className="gender-label">
            <i
              className={classNames({ 'icon-male': this.props.user.userDetails.gender === 'male', 'icon-female': this.props.user.userDetails.gender === 'female' })} />
            {this.props.user.userDetails.gender || EMPTY_STRING}
          </span>
        </Item>
      </Accordion.Navigation>
    );
  },

  renderDevicePanel() {
    return this.props.user.userDetails.devices.map((device) => {
      return (
        <Accordion.Navigation title="App Info">
          <Item label="Device">
            <span className="device-label">
              <i className={classNames({ 'icon-apple': this.checkPlatformOS(device.platform, 'ios') }, { 'icon-android': this.checkPlatformOS(device.platform, 'android') })} />
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

  render() {
    return (
      <If condition={this.props.user && this.props.user.userDetails}>
        <Panel.Wrapper addOn>
          <Panel.Header title={this.props.user.userDetails.displayName} />
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
  },

  handleSuspendClick() {
    this.context.executeAction(deactivateEndUser, this.getParams());
  },

  handleReactivateClick() {
    this.context.executeAction(reactivateEndUser, this.getParams());
  },

  handleRefreshButtonClick() {
    this.context.executeAction(fetchWallet, this.getParams());
  },

  checkPlatformOS(platform, matchOS) {
    return (platform) ? platform.toLowerCase() === matchOS : false;
  },
});

export default EndUserProfile;
