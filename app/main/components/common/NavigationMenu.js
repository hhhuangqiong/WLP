import { some } from 'lodash';
import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import { FluxibleMixin } from 'fluxible-addons-react';
import { FormattedMessage, injectIntl } from 'react-intl';

import LanguageSwitcher from './LanguageSwitcher';
import CompanySwitcher from './CompanySwitcher';
import signOut from '../../actions/signOut';
import Icon from '../Icon';

import AuthStore from '../../stores/AuthStore';

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

  render() {
    if (!this.state.isAuthenticated) {
      return null;
    }

    return (
      <section className="top-bar-section navigation-bar">
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
                <span id="navigation-bar-hello-message">
                  <FormattedMessage
                    id="hi"
                    defaultMessage="Hi"
                  />
                </span>
                <span>, </span>
                <span id="navigation-bar-display-name">{this.state.displayName}</span>
              </span>
              <Icon symbol="icon-more" />
            </a>
            <ul className="dropdown">
              <li className="navigation-bar__item">
                <a onClick={this.handleSignOut}>
                  <Icon symbol="icon-logout" />
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
