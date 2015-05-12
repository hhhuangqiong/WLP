import React from 'react';
import FluxibleMixin from 'fluxible/addons/FluxibleMixin';
import {NavLink} from 'fluxible-router';

import ApplicationStore from '../stores/ApplicationStore'

var CompanySwitcher = React.createClass({
  mixins: [FluxibleMixin],
  statics: {
    storeListeners: [ApplicationStore]
  },
  getInitialState: function () {
    return this.getStateFromStore();
  },
  getStateFromStore: function() {
    return {
      companies: this.getStore(ApplicationStore).getState().availableCompanies || []
    };
  },
  onChange: function() {
    this.setState(this.getStateFromStore());
  },
  render: function() {
    let buttons = this.state.companies.map((c) => {
        var href = "/w/" + c.carrierId + "/end-users";
        return <li className="navigation-bar__item" title={c.name} key={c.carrierId}>
          <NavLink href={href}><img src={c.logoUri}/></NavLink>
        </li>
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
