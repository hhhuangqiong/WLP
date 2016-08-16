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
    redirectToAccountHome: PropTypes.boolean,
  }

  static contextTypes = {
    executeAction: PropTypes.func.isRequired,
  }

  constructor() {
    super();
    this.fetchData = this.fetchData.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData(searchTerm) {
    const { executeAction } = this.context;
    const { currentCompany: { id } } = this.props;
    const query = {
      affiliatedCompany: id,
    };
    if (searchTerm) {
      query.search = searchTerm;
    }
    executeAction(fetchAccounts, query);
    executeAction(fetchCarrierManagingCompanies, { companyId: id });
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
