import _ from 'lodash';
import React, { PropTypes } from 'react';
import { RouteHandler } from 'react-router';
import { concurrent } from 'contra';

import FluxibleMixin from 'fluxible/addons/FluxibleMixin';
import AuthMixin from '../../../utils/AuthMixin';

import fetchManagingCompanies  from '../../../main/actions/fetchManagingCompanies';
import fetchAccounts from '../actions/fetchAccounts';
import AccountStore from '../stores/AccountStore';
import AccountTable from './AccountTable';
import AccountProfile from './AccountProfile';

export default React.createClass({
  displayName: 'Account',

  contextTypes: {
    executeAction: React.PropTypes.func.isRequired,
    router: React.PropTypes.func.isRequired
  },

  mixins: [FluxibleMixin, AuthMixin],

  statics: {
    storeListeners: [AccountStore],

    fetchData: (context, params, query, done = Function.prototype) => {
      context.executeAction(fetchAccounts, {}, done);
    }
  },

  onChange() {
    this.setState(this.getStateFromStores());
  },

  getInitialState() {
    return this.getStateFromStores();
  },

  getStateFromStores() {
    return this.getStore(AccountStore).getAccounts();
  },

  render() {
    return (
      <div className="row">
        <AccountTable accounts={this.state.accounts} />
        <RouteHandler />
      </div>
    );
  }
});
