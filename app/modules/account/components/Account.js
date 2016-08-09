import React, { PropTypes, Component } from 'react';

import { connectToStores } from 'fluxible-addons-react';

import fetchAccounts from '../actions/fetchAccounts';
import AccountStore from '../stores/AccountStore';
import AccountTable from './AccountTable';

class Account extends Component {

  static propTypes = {
    accounts: PropTypes.array.isRequired,
    children: PropTypes.element,
  }

  static contextTypes = {
    executeAction: PropTypes.func.isRequired,
    params: PropTypes.object.isRequired,
    context: PropTypes.object.isRequired,
  }

  constructor() {
    super();
    this.fetchData = this.fetchData.bind(this);
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData() {
    const { executeAction, params } = this.context;

    executeAction(fetchAccounts, {
      carrierId: params.identity,
    });
  }

  render() {
    return (
      <div className="row">
        <AccountTable accounts={this.props.accounts} />
        {this.props.children}
      </div>
    );
  }
}


Account = connectToStores(
  Account,
  [AccountStore],
  context => (context.getStore(AccountStore).getAccounts())
);

export default Account;
