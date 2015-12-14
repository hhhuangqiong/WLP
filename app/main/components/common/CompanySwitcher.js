import _ from 'lodash';
import React from 'react';
import FluxibleMixin from 'fluxible/addons/FluxibleMixin';
import Tooltip from 'rc-tooltip';

import ApplicationStore from '../../stores/ApplicationStore';
import switchCompany from '../../../modules/company/actions/switchCompany';

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

  render() {
    const buttons = this.state.companies.map(({ name, carrierId, logo, role, identity }) => {
      const logoSrc = logo ? `/data/${logo}` : DEFAULT_LOGO_SRC;

      return (
        <li className="navigation-bar__item" title={name} key={carrierId}>
          <Tooltip overlay={name}>
            <a href="#" onClick={this.switchCompany.bind(this, { role, identity })}>
              <img src={logoSrc} alt={name} />
            </a>
          </Tooltip>
        </li>
      );
    });

    return (
      <If condition={!_.isEmpty(this.state.companies)}>
        <li className="has-dropdown not-click navigation-bar__item">
          <a>
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

  switchCompany(params) {
    this.context.executeAction(switchCompany, params);
  },
});

export default CompanySwitcher;
