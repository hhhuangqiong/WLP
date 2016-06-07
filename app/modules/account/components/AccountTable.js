import _ from 'lodash';
import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import classNames from 'classnames';

import CircleIcon from '../../../main/components/CircleIcon';
import PredefinedGroups from '../constants/PredefinedGroups';
import Icon from '../../../main/components/Icon';

export default React.createClass({
  displayName: 'AccountTable',

  propTypes: {
    accounts: PropTypes.array.isRequired,
  },

  contextTypes: {
    router: PropTypes.object.isRequired,
  },

  getInitialState() {
    return { searchItem: '' };
  },

  getGroups() {
    return _.groupBy(this.props.accounts, account => account.assignedGroup);
  },

  getFilteredGroups() {
    return _.intersection(Object.keys(this.getGroups()), Object.keys(PredefinedGroups));
  },

  renderSearchBar() {
    if (!this.props.accounts.length) return null;

    return (
      <nav className="top-bar company-sidebar__search" data-topbar role="navigation">
        <input
          className="round"
          type="text"
          placeholder="Search"
          onChange={this.handleSearchAccount}
        />
        <Icon symbol="icon-search" />
      </nav>
    );
  },

  renderSearchResults() {
    const searchItems = [];

    _.forEach(this.getFilteredGroups(), group => {
      const filteredAccounts = _.filter(this.getGroups()[group], account => {
        const accountName = `${account.name.first} ${account.name.last}`;
        return _.includes(accountName.toLowerCase(), this.state.searchItem.toLowerCase());
      });

      searchItems.push(filteredAccounts);
    });

    return (
      <ul className="account-table__list">
        {this.renderAccountItems(_.flatten(searchItems))}
        <li className="divider"></li>
      </ul>
    );
  },

  renderRoleSections() {
    if (!this.props.accounts.length) {
      return null;
    }

    if (this.state.searchItem.length > 0) {
      return this.renderSearchResults();
    }

    return this.getFilteredGroups().map(group => {
      return (
        <ul className="account-table__list">
          <li className="account-table__item-catagory">{group}</li>
          {this.renderAccountItems(this.getGroups()[group])}
          <li className="divider"></li>
        </ul>
      );
    });
  },

  renderAccountItems(accounts) {
    const { role, identity, accountId } = this.context.params;

    return accounts.map(account => {
      const groupSettings = PredefinedGroups[account.assignedGroup];

      return (
        <li className={classNames('account-table__item', { active: account._id === accountId })} key={account.Id}>
          <Link to="account-profile" params={{ accountId: account._id, role, identity }}>
            <div className="account-icon left">
              <CircleIcon
                size="small"
                backgroundColor={groupSettings.backgroundColor}
                iconColor={groupSettings.iconColor}
                icon={groupSettings.icon}
              />
            </div>

            <div className="account-table__item__username">
              {account.name.first} {account.name.last}
            </div>

            <div className="account-table__item__role">
              {account.assignedGroup}
            </div>
          </Link>
        </li>
      );
    });
  },

  render() {
    return (
      <div className="account-table">
        {this.renderSearchBar()}
        {this.renderRoleSections()}
      </div>
    );
  },

  handleSearchAccount(e) {
    this.setState({
      searchItem: e.target.value.trim(),
    });
  },
});
