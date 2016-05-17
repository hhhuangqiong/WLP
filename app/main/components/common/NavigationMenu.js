import { some } from 'lodash';
import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import { FluxibleMixin } from 'fluxible-addons-react';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';

import LanguageSwitcher from './LanguageSwitcher';
import CompanySwitcher from './CompanySwitcher';
import signOut from '../../actions/signOut';
import Modal from '../../../main/components/Modal';
import ChangePasswordForm from '../../../modules/account/components/ChangePasswordForm';

import AuthStore from '../../stores/AuthStore';

defineMessages({
  changePasswordModal: {
    id: 'changePassword',
    defaultMessage: 'Change Password',
  },
});

const companyPages = [
  'companies',
  'company-create',
  'company-profile',
  'company-service',
];

const accountPages = ['account', 'account-create', 'account-profile'];

const Navigation = React.createClass({
  contextTypes: {
    getStore: PropTypes.func.isRequired,
    location: PropTypes.object,
    params: PropTypes.object,
    router: PropTypes.object,
    intl: PropTypes.object.isRequired,
  },

  mixins: [FluxibleMixin],

  statics: {
    storeListeners: [AuthStore],
  },

  getInitialState() {
    return {
      modal: 'close',
      isChangePasswordOpened: false,
      displayName: this
        .context
        .getStore(AuthStore)
        .getDisplayName(),
      isAuthenticated: this
        .context
        .getStore(AuthStore)
        .isAuthenticated(),
    };
  },

  onChange() {
    this.setState({
      displayName: this
        .context
        .getStore(AuthStore)
        .getDisplayName(),
    });
  },

  handleSignOut(e) {
    e.preventDefault();
    e.stopPropagation();
    this.context.executeAction(signOut, {});
  },

  handleOpenChangePasswordDialog() {
    this.setState({ isChangePasswordOpened: true });
  },

  handleCloseChangePasswordDialog(e) {
    if (e) e.preventDefault();
    this.setState({ isChangePasswordOpened: false });
  },

  renderCreateCompany() {
    if (some(companyPages, page => this.context.location.pathname.indexOf(page) > -1)) {
      return (
        <li className="navigation-bar__item no-border">
          <Link to={`${this.context.location.pathname}/company-create`}>
            <FormattedMessage
              id="company.createNewCompany"
              defaultMessage="Create new company"
            />
          </Link>
        </li>
      );
    }

    return null;
  },

  renderCreateUser() {
    if (some(accountPages, page => this.context.location.pathname.indexOf(page) > -1)) {
      return (
        <li className="navigation-bar__item no-border">
          <Link to={`${this.context.location.pathname}/account-create`}>
            <FormattedMessage
              id="account.createNewUser"
              defaultMessage="Create new user"
            />
          </Link>
        </li>
      );
    }

    return null;
  },

  render() {
    const { formatMessage } = this.props.intl;

    if (!this.state.isAuthenticated) {
      return null;
    }

    return (
      <section className="top-bar-section navigation-bar">
        <Modal
          title={formatMessage({ id: 'changePassword' })}
          isOpen={this.state.isChangePasswordOpened}
        >
          <ChangePasswordForm
            handleClose={this.handleCloseChangePasswordDialog}
          />
        </Modal>

        <ul className="right">
          <li className="navigation-bar__item">
            <LanguageSwitcher />
          </li>
          <li className="navigation-bar__item">
            <a href="https://support.maaii.com" target="_new">
              <FormattedMessage
                id="reportIssue"
                defaultMessage="report issue"
              />
            </a>
          </li>
          <CompanySwitcher />
          <li className="has-dropdown not-click navigation-bar__item">
            <a>
              <span>
                <FormattedMessage
                  id="hi"
                  defaultMessage="Hi"
                />
                <span>, </span>
                {this.state.displayName}
              </span>
              <i className="icon-more" />
            </a>
            <ul className="dropdown">
              <li className="navigation-bar__item">
                {/* Disable change password since it is not yet a released function */}
                {/*<a onClick={this.handleOpenChangePasswordDialog}>
                  <i className="icon-change-password"></i>
                  <FormattedMessage
                    id="changePassword"
                    defaultMessage="Change Password"
                  />
                </a>*/}
                <a onClick={this.handleSignOut}>
                  <i className="icon-logout"></i>
                  <FormattedMessage
                    id="logout"
                    defaultMessage="Logout"
                  />
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </section>
    );
  },
});

export default injectIntl(Navigation);
