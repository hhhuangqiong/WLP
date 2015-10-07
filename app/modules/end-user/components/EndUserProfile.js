import _ from 'lodash';
import {concurrent} from 'contra';
import moment from 'moment';

import React from 'react';
import FluxibleMixin from 'fluxible/addons/FluxibleMixin';
import classNames from 'classnames';

import AuthMixin from '../../../utils/AuthMixin';

import EndUserStore from '../stores/EndUserStore';

import fetchWallet from '../actions/fetchWallet';
import deleteEndUser from '../actions/deleteEndUser';
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

  handleDeleteClick: function() {
    this.context.executeAction(deleteEndUser, this.getParams());
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

  renderWalletPanel: function() {
    let wallets = (
      <Accordion.Navigation title="Wallet Info">
        <div className="error text-center">
          <div className="error-description full-width">
            <i className="error-icon icon-error3" />
            <span className="error-message">404 - not found!</span>
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
        <Accordion.Navigation title="Account Info">
          <WalletInfoItem wallet={overviewWallet} />
          {this.props.user.wallets.map((wallet)=>{
            return (
              <WalletInfoItem wallet={wallet} />
            );
          })}
        </Accordion.Navigation>
      );
    }

    return wallets;
  },

  render: function() {
    let country = _.find(Countries, (c) => {
      return c.alpha2.toLowerCase() === this.props.user.userDetails.countryCode;
    });
    let creationDate = moment(this.props.user.userDetails.creationDate).format(DATE_FORMAT);

    return (
      <If condition={this.props.user && this.props.user.userDetails}>
        <Panel.Wrapper addOn={true}>
          <Panel.Header title={this.props.user.userDetails.displayName}/>
          <Panel.Body>
            <Accordion.Wrapper offsetMargin={true}>
              {this.renderWalletPanel()}
              <Accordion.Navigation title="Account Info" hasIndicator={true} verified={this.props.user.userDetails.verified}>
                <Item label="Created Time">{creationDate}</Item>
                <Item label="Verified" capitalize={true}>
                  <If condition={this.props.user.userDetails.verified}>
                    <span className="verified">verified</span>
                    <Else />
                    <span className="unverified">unverified</span>
                  </If>
                </Item>
                <Item label="Country">
                  <div className="country-label">
                    <div className="flag__container left">
                      <span className={classNames('flag--' + country.alpha2, 'left')}/>
                    </div>
                    {country.name}
                  </div>
                </Item>
                <Item label="Mobile Number">{this.props.user.userDetails.username}</Item>
                <Item label="Email">{this.props.user.userDetails.email || EMPTY_STRING}</Item>
                <Item label="Pin">{this.props.user.userDetails.pin || EMPTY_STRING}</Item>
                <Item label="Date of Birth">{this.props.user.userDetails.birthDate || EMPTY_STRING}</Item>
                <Item label="Gender" capitalize={true}>
                  <span className="gender-label">
                    <i
                      className={classNames({'icon-male': this.props.user.userDetails.gender === 'male', 'icon-female': this.props.user.userDetails.gender === 'female'})}/>
                    {this.props.user.userDetails.gender || EMPTY_STRING}
                  </span>
                </Item>
              </Accordion.Navigation>
              <For each="device" of={this.props.user.userDetails.devices}>
                <Accordion.Navigation title="App Info">
                  <Item label="Device">
                    <span className="device-label">
                      <i className={classNames({'icon-apple': device.platform.toLowerCase() === 'ios'}, {'icon-android': device.platform.toLowerCase() === 'android'})} />
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
                  <If condition={this.props.user.userDetails.verified}>
                    <div className="accordion__item-body--control">
                      <If condition={this.props.user.userDetails.accountStatus.toLowerCase() === 'active'}>
                        <div className="accordion__item-body--control__row text-center">
                          <button className="round" onClick={this.handleDeleteClick}>delete</button>
                          <button className="round" onClick={this.handleSuspendClick}>suspend</button>
                        </div>
                        <Else />
                        <div className="accordion__item-body--control__row text-center">
                          <button className="round" onClick={this.handleDeleteClick}>delete</button>
                          <button className="round" onClick={this.handleReactivateClick}>reactivate</button>
                        </div>
                      </If>
                    </div>
                  </If>
                </Accordion.Navigation>
              </For>
            </Accordion.Wrapper>
          </Panel.Body>
        </Panel.Wrapper>
      </If>
    );
  }
});

export default EndUserProfile;
