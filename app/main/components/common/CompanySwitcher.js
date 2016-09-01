import _ from 'lodash';
import React from 'react';
import { FluxibleMixin } from 'fluxible-addons-react';

import { userPath } from '../../../utils/paths';
import ApplicationStore from '../../stores/ApplicationStore';

import Icon from '../Icon';

const DEFAULT_LOGO_SRC = '/images/logo-m800.png';

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
      companies: this.getStore(ApplicationStore).getManagingCompanies(),
    };
  },

  switchCompany(carrierId) {
    // redirecting to an existing module will work
    // a proper landing path will be checked on server-side
    // ideally it should reconstruct the defaultPath by authorityChecker
    const destination = userPath(carrierId);

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
      .map(({ name, carrierId, logo }) => {
        const logoSrc = !!logo ? logo : DEFAULT_LOGO_SRC;
        const switchCompany = this.switchCompany.bind(this, carrierId);
        return (
          <li className="navigation-bar__item" title={name} key={carrierId}>
            <a href="#" onClick={switchCompany}>
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
