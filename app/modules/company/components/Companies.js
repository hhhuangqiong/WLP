import React from 'react';
import { concurrent } from 'contra';
import { RouteHandler } from 'react-router';

import { FluxibleMixin } from 'fluxible-addons-react';

import fetchCompanies from '../actions/fetchCompanies';

import CompanyList from './CompanyList';
import CompanyStore from '../stores/CompanyStore';

const Companies = React.createClass({
  contextTypes: {
    router: React.PropTypes.func.isRequired,
  },

  mixins: [FluxibleMixin],

  statics: {
    storeListeners: [CompanyStore],

    fetchData(context, params, query, done) {
      concurrent([
        context.executeAction.bind(context, fetchCompanies, { carrierId: params.carrierId }),
      ], done || () => {});
    },
  },

  getInitialState() {
    return this.getStateFromStores();
  },

  onChange() {
    this.setState(this.getStateFromStores());
  },

  getStateFromStores() {
    return {
      companies: this.getStore(CompanyStore).getCompanies(),
    };
  },

  render() {
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
  },
});

export default Companies;
