import React, { PropTypes } from 'react';

import { FluxibleMixin } from 'fluxible-addons-react';

import fetchAccounts from '../actions/fetchAccounts';
import AccountStore from '../stores/AccountStore';
import AccountTable from './AccountTable';

export default React.createClass({
  displayName: 'Account',

  propTypes: {
    children: PropTypes.element.isRequired,
  },

  contextTypes: {
    executeAction: PropTypes.func.isRequired,
    router: PropTypes.object.isRequired,
  },

  mixins: [FluxibleMixin],

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
        {this.props.children}
      </div>
    );
  },
});
