import {concurrent} from 'contra';

import React from 'react';
import {RouteHandler} from 'react-router';

import FluxibleMixin from '../../../../node_modules/fluxible/addons/FluxibleMixin';
import AuthMixin from '../../../utils/AuthMixin';

import fetchCompanies from '../actions/fetchCompanies';

import CompanyList from './CompanyList';
import CompanyStore from '../stores/CompanyStore';

let Companies = React.createClass({
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

  getInitialState: function() {
    return this.getStateFromStores();
  },

  getStateFromStores: function() {
    return {
      companies: this.getStore(CompanyStore).getCompanies()
    };
  },

  onChange: function() {
    this.setState(this.getStateFromStores());
  },

  render: function() {
    return (
      <div className="row" data-equalizer>
        <div className="large-6 columns" data-equalizer-watch>
          <CompanyList companies={this.state.companies} />
        </div>
        <div className="large-18 columns" data-equalizer-watch>
          <div className="row">
            <RouteHandler />
          </div>
        </div>
      </div>
    );
  }
});

export default Companies;
