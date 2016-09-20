import React, { PropTypes, Component } from 'react';

import { connectToStores } from 'fluxible-addons-react';

import fetchAccounts from '../actions/fetchAccounts';
import fetchCarrierManagingCompanies from '../actions/fetchCarrierManagingCompanies';
import ApplicationStore from '../../../main/stores/ApplicationStore';
import AccountStore from '../stores/AccountStore';
import AccountTable from './AccountTable';

class Account extends Component {
  static propTypes = {
    accounts: PropTypes.array.isRequired,
    currentCompany: PropTypes.object.isRequired,
    children: PropTypes.element,
  }

  static contextTypes = {
    executeAction: PropTypes.func.isRequired,
    params: PropTypes.object,
    location: PropTypes.shape({
      pathname: PropTypes.string,
    }),
  }

  constructor() {
    super();
    this.fetchData = this.fetchData.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
  }

  componentDidMount() {
    this.fetchData();
  }

  componentWillReceiveProps(nextProps) {
    // update the list when change from has children to  no children(no display on right hand side)
    // e.g after create, discard, update, delete account
    // update the list when change from create to edit mode by checking the params accountId
    if ((this.props.children && !nextProps.children) ||
     (!this.props.params.accountId && nextProps.params.accountId)) {
      this.fetchData();
    }
  }

  fetchData(searchTerm) {
    const { executeAction, params: { identity } } = this.context;
    const query = { carrierId: identity };
    if (searchTerm) {
      query.search = searchTerm;
    }
    executeAction(fetchAccounts, query);
    executeAction(fetchCarrierManagingCompanies, { carrierId: identity });
  }

  handleSearch(e) {
    e.preventDefault();
    // get the value from the input
    const term = e.target.value.trim();
    this.fetchData(term);
  }

  render() {
    return (
      <div className="row">
        <AccountTable
          ref="AccountTable"
          accounts={this.props.accounts}
          handleSearch={this.handleSearch}
        />
        {this.props.children}
      </div>
    );
  }
}

Account = connectToStores(
  Account,
  [AccountStore, ApplicationStore],
  context => ({
    accounts: context.getStore(AccountStore).getAccounts(),
    currentCompany: context.getStore(ApplicationStore).getCurrentCompany(),
  })
);

export default Account;
