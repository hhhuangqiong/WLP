import { get, first, isNull } from 'lodash';
import moment from 'moment';

import React, { PropTypes } from 'react';
import { defineMessages, FormattedMessage, intlShape, injectIntl } from 'react-intl';

import fetchWallet from '../actions/fetchWallet';
import deactivateEndUser from '../actions/deactivateEndUser';
import reactivateEndUser from '../actions/reactivateEndUser';

import * as Accordion from '../../../main/components/Accordion';
import * as Panel from '../../../main/components/Panel';
import CountryFlag from '../../../main/components/CountryFlag';
import Icon from '../../../main/components/Icon';
import Permit from '../../../main/components/common/Permit';

import WalletInfoItem from './WalletInfoItem';
import Item from './InfoItem';
import { RESOURCE, ACTION, permission } from '../../../main/acl/acl-enums';

const { displayDateFormat: DATE_FORMAT } = require('./../../../main/config');
import { getCountryName } from '../../../utils/StringFormatter';

import getPlatformInfo from '../utils/getPlatformInfo';
import i18nMessages from '../../../main/constants/i18nMessages';
import * as dateLocale from '../../../utils/dateLocale';


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

  renderGenderInfo(type) {
    const { intl: { formatMessage } } = this.props;
    const EMPTY_STRING = formatMessage(i18nMessages.unknownLabel);
    if (!type) {
      return (EMPTY_STRING);
    }

    const gender = type.toLowerCase();

    switch (gender) {
      case 'male':
      case 'female':
        return (
          <span>
            <Icon key={gender} symbol={`icon-${gender}`} />
            {formatMessage(MESSAGES[gender])}
          </span>
        );
      default:
        return (<span>EMPTY_STRING</span>);
    }
  },

  renderWalletPanel() {
    const { intl: { formatMessage } } = this.props;

    let wallets = (
      <Accordion.Navigation title={formatMessage(MESSAGES.walletTitle)}>
        <div className="error text-center">
          <div className="error-description full-width">
            <Icon className="error-icon" symbol="icon-error3" />
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
                <Icon symbol="icon-refresh" />
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

    const details = get(this.props, 'user.userDetails', {});

    const { username, gender, verified, email, pin, birthDate } = details;
    const creationDate = dateLocale.format(moment(details.creationDate), DATE_FORMAT);
    const countryCode = (details.countryCode || '').toLowerCase();

    return (
      <Accordion.Navigation
        title={formatMessage(MESSAGES.accountTitle)}
        verified={verified}
        hasIndicator
      >
        <Item label={formatMessage(MESSAGES.createdTime)} className="end-user-info__created-time">{creationDate}</Item>
        <Item label={formatMessage(MESSAGES.verified)} capitalize>
          <If condition={verified}>
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
        <Item label={formatMessage(MESSAGES.username)}>{username}</Item>
        <Item label={formatMessage(MESSAGES.email)}>{email || EMPTY_STRING}</Item>
        <Item label={formatMessage(MESSAGES.pin)}>{pin || EMPTY_STRING}</Item>
        <Item label={formatMessage(MESSAGES.dateOfBirth)}>{birthDate || EMPTY_STRING}</Item>
        <Item label={formatMessage(MESSAGES.gender)} capitalize>
          <span className="gender-label">
            {this.renderGenderInfo(gender)}
          </span>
        </Item>
      </Accordion.Navigation>
    );
  },

  renderDevicePanel() {
    const { intl: { formatMessage } } = this.props;
    const EMPTY_STRING = formatMessage(i18nMessages.unknownLabel);
    const devices = get(this.props, 'user.userDetails.devices');

    if (!devices) {
      return [];
    }

    return devices.map((device) =>
      (
        <Accordion.Navigation title={formatMessage(MESSAGES.appTitle)} key={device.platform}>
          <Item label={formatMessage(MESSAGES.device)}>
            <span className="device-label">
              <Icon key={getPlatformInfo(device.platform).iconClass} symbol={getPlatformInfo(device.platform).iconClass} />
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
      ));
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
            <Permit permission={permission(RESOURCE.END_USER, ACTION.UPDATE)}>
              <div className="enduser-profile__control text-center">
                <div className="enduser-profile__control__row">
                  <If condition={this.props.user.userDetails.accountStatus.toLowerCase() === 'active'}>
                    <button className="round" onClick={this.handleSuspendClick}>
                      <FormattedMessage
                        id="endUser.details.suspend"
                        defaultMessage="Suspend"
                      />
                    </button>
                  <Else />
                    <button className="round" onClick={this.handleReactivateClick}>
                    <FormattedMessage
                      id="endUser.details.reactivate"
                      defaultMessage="Reactivate"
                    />
                    </button>
                  </If>
                </div>
              </div>
            </Permit>
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
