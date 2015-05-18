import React from 'react';
import FluxibleMixin from 'fluxible/addons/FluxibleMixin';
import {Link} from 'react-router';

import ApplicationStore from '../stores/ApplicationStore'

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
    let buttons = this.state.companies.map((c) => {
        let logoUri = c.logo ? `/data/${c.logo}` : '/images/default-logo.png';
        return (
          <li className="navigation-bar__item" title={c.name} key={c.carrierId}>
            <Link to="overview" params={{ role: c.role, identity: c.identity}}><img src={logoUri} /></Link>
          </li>
        );
      }
    );
    return (
      <ul className="dropdown dropdown--company-switcher">
        {buttons}
      </ul>
    );
  }
});

export default CompanySwitcher;
