import _ from 'lodash';
import React from 'react';
import { FluxibleMixin } from 'fluxible-addons-react';
import { browserHistory } from 'react-router';

import { userPath } from '../../../server/paths';
import ApplicationStore from '../../stores/ApplicationStore';

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
    const { role, identity } = params;
    const destination = userPath(role, identity, '/');
    browserHistory.push(destination);
  },

  render() {
    const buttons = this
      .state
      .companies
      .map(({ attributes: { name, carrierId, logo, role, identity } }) => {
        const logoSrc = logo ? `/data/${logo}` : DEFAULT_LOGO_SRC;

        return (
          <li className="navigation-bar__item" title={name} key={carrierId}>
            <a href="#" onClick={this.switchCompany.bind(this, { role, identity })}>
              <img src={logoSrc} alt={name} />
            </a>
          </li>
        );
      });

    return (
      <If condition={!_.isEmpty(this.state.companies)}>
        <li className="has-dropdown not-click navigation-bar__item">
          <a className="company-switcher">
            <span className="icon-companymenu" />
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
