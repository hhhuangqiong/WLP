import React, { PropTypes, Component } from 'react';

import { connectToStores } from 'fluxible-addons-react';
import { Link } from 'react-router';
import classNames from 'classnames';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';

import Icon from '../../../main/components/Icon';
import Permit from '../../../main/components/common/Permit';
import { RESOURCE, ACTION, permission } from '../../../main/acl/acl-enums';

import { MESSAGES } from './../constants/i18n';
import fetchAccounts from '../actions/fetchAccounts';
import fetchCarrierManagingCompanies from '../actions/fetchCarrierManagingCompanies';
import ApplicationStore from '../../../main/stores/ApplicationStore';
import AccountStore from '../stores/AccountStore';
import AccountTable from './AccountTable';

class Account extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    accounts: PropTypes.array.isRequired,
    currentCompany: PropTypes.object.isRequired,
    children: PropTypes.element,
    pageSize: PropTypes.number,
    page: PropTypes.number,
    totalElements: PropTypes.number,
    params: PropTypes.object,
  }

  static contextTypes = {
    executeAction: PropTypes.func.isRequired,
    params: PropTypes.object,
    location: PropTypes.shape({
      pathname: PropTypes.string,
    }),
  }

  constructor(props) {
    super(props);
    this.state = { searchTerm: null };
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

  fetchData = (searchTerm) => {
    const { executeAction, params: { identity } } = this.context;
    const query = { carrierId: identity, pageSize: this.props.pageSize, page: 0 };
    if (searchTerm) {
      query.search = searchTerm;
    }
    executeAction(fetchAccounts, query);
    executeAction(fetchCarrierManagingCompanies, { carrierId: identity });
  }

  handleSearch = (e) => {
    e.preventDefault();
    // get the value from the input
    const term = e.target.value.trim();
    this.setState({ searchTerm: term });
    this.fetchData(term);
  }

  handlePageChange = (pageOptions) => {
    const query = {
      carrierId: this.context.params.identity,
      pageSize: pageOptions.pageSize,
      page: pageOptions.pageNumber,
    };
    if (this.state.searchTerm) {
      query.search = this.state.searchTerm;
    }
    this.context.executeAction(fetchAccounts, query);
  }

  renderHeader = () => {
    const { identity } = this.context.params;
    const { formatMessage } = this.props.intl;
    return (
      <nav className="top-bar table__search" data-topbar role="navigation">
        <div className="left top-bar--inner table__search--left">
          <FormattedMessage
            id="accountManagement"
            defaultMessage="Account Management"
          />
        </div>
        <div className="table__search--right top-bar--inner right">
          <Link to={`/${identity}/account/create`}>
            <button
              tabIndex="0"
              className={classNames(
              'account-top-bar__button-primary',
              'button',
              'round',
              'large',
              'item',
              'button-create',
              )
            }
            >
              <Permit permission={permission(RESOURCE.USER, ACTION.CREATE)}>
                <FormattedMessage
                  id="createNewAccount"
                  defaultMessage="Create New Account"
                />
              </Permit>
            </button>
          </Link>
          <div className="table__search--right__input">
            <input
              className="round"
              type="text"
              placeholder={formatMessage(MESSAGES.search)}
              onChange={this.handleSearch}
            />
            <Icon symbol="icon-search" />
          </div>
        </div>
      </nav>
    );
  }

  render() {
    return (
      <div className="row">
        {this.renderHeader()}
        <AccountTable
          ref="AccountTable"
          accounts={this.props.accounts}
          handleSearch={this.handleSearch}
          pageSize={this.props.pageSize}
          page={this.props.page}
          totalElements={this.props.totalElements}
          handlePageChange={this.handlePageChange}
        />
      </div>
    );
  }
}

Account = connectToStores(
  Account,
  [AccountStore, ApplicationStore],
  context => ({
    accounts: context.getStore(AccountStore).getAccounts(),
    pageSize: context.getStore(AccountStore).getPageSize(),
    page: context.getStore(AccountStore).getPage(),
    totalElements: context.getStore(AccountStore).getTotalElements(),
    currentCompany: context.getStore(ApplicationStore).getCurrentCompany(),
  })
);

export default injectIntl(Account);
