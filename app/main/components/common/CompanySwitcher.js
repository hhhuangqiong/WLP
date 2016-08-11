import _ from 'lodash';
import React, { PropTypes } from 'react';
import { FluxibleMixin } from 'fluxible-addons-react';
import { browserHistory } from 'react-router';

import { userPath } from '../../../utils/paths';
import ApplicationStore from '../../stores/ApplicationStore';

import Icon from '../Icon';

const DEFAULT_LOGO_SRC = '/images/default-logo.png';

const CompanySwitcher = React.createClass({
  mixins: [FluxibleMixin],

  statics: {
    storeListeners: [ApplicationStore],
  },

  getInitialState() {
    return this.getStateFromStore();
  },

  onChange() {
    this.setState(this.getStateFromStore());
  },

  getStateFromStore() {
    return {
      companies: this.getStore(ApplicationStore).getManagingCompanies() || [],
    };
  },

  switchCompany(params) {
    const { identity } = params;

    // redirecting to an existing module will work
    // a proper landing path will be checked on server-side
    // ideally it should reconstruct the defaultPath by authorityChecker
    const destination = userPath(identity, '/overview');

    // it should always be a client side process
    // let's refresh the page at this moment, until we
    // establish a mechanism to detect identity change in every page
    if (window) {
      window.location.assign(destination);
    }
  },

  render() {
    const buttons = this
      .state
      .companies
      .map(({ attributes: { name, carrierId, logo, identity } }) => {
        const logoSrc = logo ? `/data/${logo}` : DEFAULT_LOGO_SRC;

        return (
          <li className="navigation-bar__item" title={name} key={carrierId}>
            <a href="#" onClick={this.switchCompany.bind(this, { identity })}>
              <img src={logoSrc} alt={name} />
            </a>
          </li>
        );
      });

    return (
      <If condition={!_.isEmpty(this.state.companies)}>
        <li className="has-dropdown not-click navigation-bar__item">
          <a className="company-switcher">
            <Icon symbol="icon-companymenu" />
          </a>
          <ul className="dropdown dropdown--company-switcher">
            {buttons}
          </ul>
        </li>
      <Else />
        { null }
      </If>
    );
  },
});

export default CompanySwitcher;
