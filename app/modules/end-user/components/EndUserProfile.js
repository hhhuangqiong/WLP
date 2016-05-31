import { get, first, isNull } from 'lodash';
import moment from 'moment';

import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { defineMessages, FormattedMessage, intlShape, injectIntl } from 'react-intl';

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

import getPlatformInfo from '../utils/getPlatformInfo';
import i18nMessages from '../../../main/constants/i18nMessages';

const MESSAGES = defineMessages({
  walletTitle: {
    id: 'endUser.profile.wallet.title',
    defaultMessage: 'Wallet Info',
  },
  accountTitle: {
    id: 'endUser.profile.account.title',
    defaultMessage: 'Account Info',
  },
  appTitle: {
    id: 'endUser.profile.app.title',
    defaultMessage: 'App Info',
  },
  createdTime: {
    id: 'endUser.profile.createdTime',
    defaultMessage: 'Created Time',
  },
  verified: {
    id: 'endUser.profile.verified',
    defaultMessage: 'Verified',
  },
  country: {
    id: 'endUser.profile.country',
    defaultMessage: 'Country',
  },
  username: {
    id: 'endUser.profile.username',
    defaultMessage: 'Username',
  },
  email: {
    id: 'endUser.profile.email',
    defaultMessage: 'Email',
  },
  pin: {
    id: 'endUser.profile.pin',
    defaultMessage: 'Pin',
  },
  dateOfBirth: {
    id: 'endUser.profile.dateOfBirth',
    defaultMessage: 'Date of Birth',
  },
  gender: {
    id: 'endUser.profile.gender',
    defaultMessage: 'Gender',
  },
  device: {
    id: 'endUser.profile.device',
    defaultMessage: 'Device',
  },
  version: {
    id: 'endUser.profile.version',
    defaultMessage: 'Version',
  },
  language: {
    id: 'endUser.profile.language',
    defaultMessage: 'Language',
  },
  male: {
    id: 'endUser.profile.gender.male',
    defaultMessage: 'Male',
  },
  female: {
    id: 'endUser.profile.gender.female',
    defaultMessage: 'Female',
  },
});

const EndUserProfile = React.createClass({
  propTypes: {
    intl: intlShape.isRequired,
    user: PropTypes.shape({
      userDetails: PropTypes.shape({
        username: PropTypes.string.isRequired,
      }),
    }),
  },

  contextTypes: {
    executeAction: React.PropTypes.func.isRequired,
    router: PropTypes.object.isRequired,
    params: PropTypes.object.isRequired,
  },

  getParams() {
    const { identity: carrierId } = this.context.params;
    const username = get(this.props, 'user.userDetails.username');

    return { carrierId, username };
  },

  renderWalletPanel() {
    const { intl: { formatMessage } } = this.props;

    let wallets = (
      <Accordion.Navigation title={formatMessage(MESSAGES.walletTitle)}>
        <div className="error text-center">
          <div className="error-description full-width">
            <i className="error-icon icon-error3" />
            <span className="error-message">
              <FormattedMessage
                id="endUser.details.walletInfoUnavailable"
                defaultMessage="Wallet info unavailable"
              />
            </span>
          </div>
          {
            // retry button should only available when action failed
            // if fetchWallet action is failed,
            // store will assign null to user.wallets,
            // otherwise, it will always be an array even an empty one
            isNull(this.props.user.wallets) ? (
              <div className="error-button" onClick={this.handleRefreshButtonClick}>
                <i className="icon-refresh" />
              </div>
            ) : null
          }
        </div>
      </Accordion.Navigation>
    );

    if (this.props.user.wallets && this.props.user.wallets.length > 0) {
      // create an overview wallet
      const overviewWallet = {
        walletType: 'overview',
        // assume the currency are consistent between free & paid wallet
        currency: first(get(this.props, 'user.wallets')).currency,
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
        <Accordion.Navigation title={formatMessage(MESSAGES.walletTitle)}>
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
    const { intl: { formatMessage } } = this.props;
    const EMPTY_STRING = formatMessage(i18nMessages.unknownLabel);
    const gender = get(this.props, 'user.userDetails.gender');
    const creationDate = moment(this.props.user.userDetails.creationDate).format(DATE_FORMAT);
    const countryCode = (this.props.user.userDetails.countryCode || '').toLowerCase();

    return (
      <Accordion.Navigation
        title={formatMessage(MESSAGES.accountTitle)}
        verified={get(this.props, 'user.userDetails.verified')}
        hasIndicator
      >
        <Item label={formatMessage(MESSAGES.createdTime)} className="end-user-info__created-time">{creationDate}</Item>
        <Item label={formatMessage(MESSAGES.verified)} capitalize>
          <If condition={this.props.user.userDetails.verified}>
            <span className="verified">
              <FormattedMessage
                id="endUser.details.verified"
                defaultMessage="Verified"
              />
            </span>
            <Else />
            <span className="unverified">
              <FormattedMessage
                id="endUser.details.unverified"
                defaultMessage="Unverified"
              />
            </span>
          </If>
        </Item>
        <Item label={formatMessage(MESSAGES.country)}>
          <div className="country-label">
            <CountryFlag code={countryCode} />
            {getCountryName(countryCode) || EMPTY_STRING}
          </div>
        </Item>
        <Item label={formatMessage(MESSAGES.username)}>{this.props.user.userDetails.jid}</Item>
        <Item label={formatMessage(MESSAGES.email)}>{this.props.user.userDetails.email || EMPTY_STRING}</Item>
        <Item label={formatMessage(MESSAGES.pin)}>{this.props.user.userDetails.pin || EMPTY_STRING}</Item>
        <Item label={formatMessage(MESSAGES.dateOfBirth)}>{this.props.user.userDetails.birthDate || EMPTY_STRING}</Item>
        <Item label={formatMessage(MESSAGES.gender)} capitalize>
          <span className="gender-label">
            <i
              className={classNames({ 'icon-male': this.props.user.userDetails.gender === 'male', 'icon-female': this.props.user.userDetails.gender === 'female' })} />
            {
              !!gender ? formatMessage(MESSAGES[gender.toLowerCase()]) : EMPTY_STRING
            }
          </span>
        </Item>
      </Accordion.Navigation>
    );
  },

  renderDevicePanel() {
    const { intl: { formatMessage } } = this.props;
    const EMPTY_STRING = formatMessage(i18nMessages.unknownLabel);

    return this.props.user.userDetails.devices.map((device) => {
      return (
        <Accordion.Navigation title={formatMessage(MESSAGES.appTitle)}>
          <Item label={formatMessage(MESSAGES.device)}>
            <span className="device-label">
              <i className={classNames(getPlatformInfo(device.platform).iconClass)} />
              {formatMessage(getPlatformInfo(device.platform).name)}
            </span>
          </Item>
          <Item label={formatMessage(MESSAGES.version)}>
            <If condition={device.appVersionNumber}>
              <span>v{device.appVersionNumber}</span>
            <Else />
              <span>{EMPTY_STRING}</span>
            </If>
          </Item>
          <Item label={formatMessage(MESSAGES.language)}>{device.appLanguage}</Item>
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

export default injectIntl(EndUserProfile);
