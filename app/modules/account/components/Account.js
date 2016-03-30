import React, { PropTypes } from 'react';
import { RouteHandler } from 'react-router';

import { FluxibleMixin } from 'fluxible-addons-react';
import AuthMixin from '../../../utils/AuthMixin';

import fetchAccounts from '../actions/fetchAccounts';
import AccountStore from '../stores/AccountStore';
import AccountTable from './AccountTable';

export default React.createClass({
  displayName: 'Account',

  contextTypes: {
    executeAction: PropTypes.func.isRequired,
    router: PropTypes.func.isRequired,
  },

  mixins: [FluxibleMixin, AuthMixin],

  statics: {
    storeListeners: [AccountStore],

    fetchData: (context, params, query, done = Function.prototype) => {
      context.executeAction(fetchAccounts, { carrierId: params.identity }, done);
    },
  },

  getInitialState() {
    return this.getStateFromStores();
  },

  onChange() {
    this.setState(this.getStateFromStores());
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
  },
});
