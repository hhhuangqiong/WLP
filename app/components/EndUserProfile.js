import _ from 'lodash';
import {concurrent} from 'contra';
import moment from 'moment';

import React from 'react';
import FluxibleMixin from 'fluxible/addons/FluxibleMixin';
import classNames from 'classnames';

import AuthMixin from '../utils/AuthMixin';

import AuthStore from '../stores/AuthStore';
import EndUserStore from '../stores/EndUserStore';

import deleteEndUser from '../actions/deleteEndUser';
import deactivateEndUser from '../actions/deactivateEndUser';
import reactivateEndUser from '../actions/reactivateEndUser';

import InfoPanel from './InfoPanel';
import Section from './InfoBlock';
import WalletInfoItem from './WalletInfoItem';
import Item from './InfoItem';

var Countries = require('../data/countries.json');

var EndUserProfile = React.createClass({
  contextTypes: {
    executeAction: React.PropTypes.func.isRequired,
    router: React.PropTypes.func.isRequired
  },

  mixins: [AuthMixin],

  handleDeleteClick: function() {
    this.context.executeAction(deleteEndUser, {
      carrierId: this.props.user.carrierId,
      username: this.props.user.userDetails.username
    });
  },

  handleSuspendClick: function() {
    this.context.executeAction(deactivateEndUser, {
      carrierId: this.props.user.carrierId,
      username: this.props.user.userDetails.username
    });
  },

  handleReactivateClick: function() {
    this.context.executeAction(reactivateEndUser, {
      carrierId: this.props.user.carrierId,
      username: this.props.user.userDetails.username
    });
  },

  render: function() {
    let wallets = (
      <Section title="Wallet Info">
        <p>Wallet not found!</p>
      </Section>
    );

    if (this.props.user.wallets && this.props.user.wallets.length > 0) {

      // create an overview wallet
      let overviewWallet = {
        walletType: 'overview',
        // assume the currency are consistent between free & paid wallet
        currency: _.first(this.props.user.wallets).currency,
        balance: 0
      };

      this.props.user.wallets.map((wallet)=>{
        overviewWallet.balance += +wallet.balance;
        // the business logic saying that the expiry date
        // would always be the same, pick the latter one
        // in case it comes with difference
        overviewWallet.expiryDate = overviewWallet.expiryDate ? wallet.expiryDate : (
          moment(overviewWallet.expiryDate).isAfter(moment(wallet.expiryDate)) ? overviewWallet.expiryDate : wallet.expiryDate
        );
      });

      wallets = (
        <Section title="Wallet Info">
          <WalletInfoItem wallet={overviewWallet} />
          {this.props.user.wallets.map((wallet)=>{
            return (
              <WalletInfoItem wallet={wallet} />
            );
          })}
        </Section>
      );
    }

    let country = _.find(Countries, (c) => {
      return c.alpha2.toLowerCase() == this.props.user.userDetails.countryCode;
    });
    let creationDate = moment(this.props.user.userDetails.creationDate).format('MMM DD, YYYY h:mm:ss a');

    return (
      <If condition={this.props.user && this.props.user.userDetails}>
        <InfoPanel title={this.props.user.userDetails.displayName}>
          {wallets}
          <Section title="Account Info" hasIndicator={true} verified={this.props.user.userDetails.verified}>
            <Item label="Created Time">{creationDate}</Item>
            <Item label="Verified" class="verified" capitalize={true}>
              <If condition={this.props.user.userDetails.verified}>
                <span className="">verified</span>
              <Else />
                <span className="">not yet</span>
              </If>
            </Item>
            <Item label="Country">{country.name}</Item>
            <Item label="Mobile Number">{this.props.user.userDetails.username}</Item>
            <Item label="Email">{this.props.user.userDetails.email || 'N/A'}</Item>
            <Item label="Pin">{this.props.user.userDetails.pin}</Item>
            <Item label="Date of Birth">{this.props.user.userDetails.birthDate || 'N/A'}</Item>
            <Item label="Gender" capitalize={true}>
              <span>
                <i className={classNames({'icon-male': this.props.user.userDetails.gender === 'male', 'icon-female': this.props.user.userDetails.gender === 'female'})} />
                {this.props.user.userDetails.gender || 'N/A'}
              </span>
            </Item>
          </Section>
          <For each="device" of={this.props.user.userDetails.devices}>
            <Section title="App Info">
              <Item label="Device">
                <span>
                  <i className={classNames({'icon-apple': device.platform.toLowerCase() === 'ios'}, {'icon-android': device.platform.toLowerCase() === 'android'})} />
                  {device.platform}
                </span>
              </Item>
              <Item label="Version">
                <If condition={device.appVersionNumber}>
                  <span>v{device.appVersionNumber}</span>
                <Else />
                  <span>N/A</span>
                </If>
              </Item>
              <Item label="Language">{device.appLanguage}</Item>
            </Section>
          </For>
          <If condition={this.props.user.userDetails.verified}>
            <Section>
              <div className="accordion__item__body--control">
                <If condition={this.props.user.userDetails.accountStatus.toLowerCase() === 'active'}>
                  <div className="accordion__item__body--control__row text-center">
                    <button className="round" onClick={this.handleDeleteClick}>delete</button>
                    <button className="round" onClick={this.handleSuspendClick}>suspend</button>
                  </div>
                  <Else />
                  <div className="accordion__item__body--control__row text-center">
                    <button className="round" onClick={this.handleDeleteClick}>delete</button>
                    <button className="round" onClick={this.handleReactivateClick}>reactivate</button>
                  </div>
                </If>
              </div>
            </Section>
          </If>
        </InfoPanel>
      </If>
    );
}
});

export default EndUserProfile;
