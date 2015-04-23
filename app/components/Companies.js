'use strict';
import React from 'react';
import {NavLink} from 'flux-router-component';
import {FluxibleMixin} from 'fluxible';

import CompanyStore from 'app/stores/CompanyStore';

import Company from 'app/components/Company';
import CompanyList from 'app/components/CompanyList';

var Companies = React.createClass({
  mixins: [FluxibleMixin],
  statics: {
    storeListeners: [CompanyStore]
  },
  getInitialState: function () {
    return this.getStore(CompanyStore).getState();
  },
  onChange: function() {
    let state = this.getStore(CompanyStore).getState();
    this.setState(state);
  },
  render: function() {
    return (
      <div className="row">
        <div className="large-7 columns">
          <CompanyList companies={this.state.companies}/>
        </div>
        <div className="large-17 columns">
          <Company company={this.state.company}/>
        </div>
      </div>
    );
  }
});

export default Companies;
