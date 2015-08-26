import _ from 'lodash';
import React from 'react';
import FluxibleMixin from 'fluxible/addons/FluxibleMixin';
import {Link} from 'react-router';

import ApplicationStore from '../stores/ApplicationStore';

const DEFAULT_LOGO_SRC = '/images/default-logo.png'

var CompanySwitcher = React.createClass({
  mixins: [FluxibleMixin],

  statics: {
    storeListeners: [ApplicationStore]
  },

  getInitialState: function() {
    return this.getStateFromStore();
  },

  getStateFromStore: function() {
    return {
      companies: this.getStore(ApplicationStore).getManagingCompanies() || []
    };
  },

  onChange: function() {
    this.setState(this.getStateFromStore());
  },

  render: function() {
    let buttons = this.state.companies.map(({ name, carrierId, logo, role, identity }) => {
        let logoSrc = logo ? `/data/${logo}` : DEFAULT_LOGO_SRC;
        return (
          <li className="navigation-bar__item" title={name} key={carrierId}>
            <Link to="overview" params={{ role, identity }}>
              <img src={logoSrc} />
            </Link>
          </li>
        );
      }
    );

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
  }
});

export default CompanySwitcher;
