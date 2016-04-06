import _ from 'lodash';
import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import FluxibleMixin from 'fluxible/addons/FluxibleMixin';

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
            create new company
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
            create user
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
          {this.renderCreateUser()}
          {this.renderCreateCompany()}
          <li className="navigation-bar__item">
            <a href="https://support.maaii.com" target="_new">report issue</a>
          </li>
          <CompanySwitcher />
          <li className="has-dropdown not-click navigation-bar__item">
            <a>
              <span className="navigation-bar__display-name">hi, {this.state.displayName}</span>
              <i className="icon-more" />
            </a>
            <ul className="dropdown">
              <li className="navigation-bar__item">
                <a onClick={this.handleOpenChangePasswordDialog}>
                  <i className="icon-change-password"></i>
                  Change Password
                </a>
                <a href="" onClick={this.handleSignOut}>
                  <i className="icon-logout"></i>
                  logout
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </section>
    );
  },
});

Navigation.contextTypes = {
  getStore: PropTypes.func.isRequired,
  executeAction: PropTypes.func.isRequired,
  router: PropTypes.func.isRequired,
};

export default Navigation;
