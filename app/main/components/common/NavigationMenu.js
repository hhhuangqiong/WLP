import _ from 'lodash';
import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import { FluxibleMixin } from 'fluxible-addons-react';
import { FormattedMessage } from 'react-intl';

import CompanySwitcher from './CompanySwitcher';
import signOut from '../../actions/signOut';
import Modal from '../../../main/components/Modal';
import ChangePasswordForm from '../../../modules/account/components/ChangePasswordForm';

import AuthStore from '../../stores/AuthStore';

const companyPages = [
  'companies',
  'company-create',
  'company-profile',
  'company-widget',
  'company-service',
];

const accountPages = ['account', 'account-create', 'account-profile'];

const Navigation = React.createClass({
  contextTypes: {
    getStore: PropTypes.func.isRequired,
    location: PropTypes.object,
    params: PropTypes.object,
    router: PropTypes.object,
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
    const currentRoute = _.last(this
      .context
      .router
      .getCurrentRoutes()
    );

    const { role, identity } = this
      .context
      .router
      .getCurrentParams();

    if (_.includes(companyPages, currentRoute.name)) {
      return (
        <li className="navigation-bar__item no-border">
          <Link to="company-create" params={{ role, identity }}>
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
    const currentRoute = _.last(this
      .context
      .router
      .getCurrentRoutes()
    );

    const { role, identity } = this
      .context
      .router
      .getCurrentParams();

    if (_.includes(accountPages, currentRoute.name)) {
      return (
        <li className="navigation-bar__item no-border">
          <Link to="account-create" params={{ role, identity }}>
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
    if (!this.state.isAuthenticated) {
      return null;
    }

    return (
      <section className="top-bar-section navigation-bar">
        <Modal
          title="Change Password"
          isOpen={this.state.isChangePasswordOpened}
        >
          <ChangePasswordForm
            handleClose={this.handleCloseChangePasswordDialog}
          />
        </Modal>

        <ul className="right">
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
                <a onClick={this.handleOpenChangePasswordDialog}>
                  <i className="icon-change-password"></i>
                  <FormattedMessage
                    id="changePassword"
                    defaultMessage="Change Password"
                  />
                </a>
                <a href="" onClick={this.handleSignOut}>
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

export default Navigation;
