import {concurrent} from 'contra';

import React from 'react';

import FluxibleMixin from 'fluxible/addons/FluxibleMixin';
import AuthMixin from '../utils/AuthMixin';

import CompanyStore from '../stores/CompanyStore';

import fetchCompanies from '../actions/fetchCompanies';

import Company from './Company';
import CompanyList from './CompanyList';

var Companies = React.createClass({
  contextTypes: {
    router: React.PropTypes.func.isRequired
  },

  mixins: [FluxibleMixin, AuthMixin],

  statics: {
    storeListeners: [CompanyStore],

    fetchData: function(context, params, query, done) {
      concurrent([
        context.executeAction.bind(context, fetchCompanies, { carrierId: params.carrierId })
      ], done || function() {});
    }
  },

  /**
   * get states of Company List and Current Company from CompanyStore
   *
   * @returns {Object}
   */
  getInitialState: function () {
    return this.getStateFromStores();
  },

  getStateFromStores: function() {
    return {
      companies: this.getStore(CompanyStore).getCompanies(),
      company: this.getStore(CompanyStore).getCurrentCompany()
    };
  },

  /**
   * capture Company Store changes and take effect
   */
  onChange: function() {
    this.setState(this.getStateFromStores());
  },

  render: function() {
    let navParams = this.context.router.getCurrentParams();
    let subPage = navParams.subPage || 'profile';

    return (
      <div className="row" data-equalizer>
        <div className="large-6 columns" data-equalizer-watch>
          <CompanyList companies={this.state.companies}/>
        </div>
        <div className="large-18 columns" data-equalizer-watch>
          <Company company={this.state.company} subPage={subPage}/>
        </div>
      </div>
    );
  }
});

export default Companies;
