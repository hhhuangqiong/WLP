import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import classNames from 'classnames';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';

import CircleIcon from '../../../main/components/CircleIcon';
import Icon from '../../../main/components/Icon';
import { MESSAGES } from './../constants/i18n';

const AccountTable = React.createClass({
  displayName: 'AccountTable',

  propTypes: {
    intl: intlShape.isRequired,
    accounts: PropTypes.array.isRequired,
    handleSearch: PropTypes.func.isRequired,
  },

  contextTypes: {
    router: PropTypes.object.isRequired,
    params: PropTypes.object.isRequired,
  },

  renderSearchBar() {
    const { formatMessage } = this.props.intl;
    return (
      <nav className="top-bar company-sidebar__search" data-topbar role="navigation">
        <input
          className="round"
          type="text"
          placeholder={formatMessage(MESSAGES.search)}
          onChange={this.props.handleSearch}
        />
        <Icon symbol="icon-search" />
      </nav>
    );
  },

  renderHeader() {
    const { identity } = this.context.params;
    const userNo = this.props.accounts.length;
    return (
      <div className="header inline-with-space narrow">
        <h5 className="title inline text-center">
          <FormattedMessage
            id="users"
            defaultMessage="Users"
          />
        ({userNo})
        </h5>
        <Link to={`/${identity}/account/create`}>
          <Icon symbol="icon-user-management" className="right" />
        </Link>
      </div>
    );
  },

  renderRoleSections() {
    if (!this.props.accounts.length) {
      return null;
    }

    return (
      <ul className="account-table__list">
        <li className="account-table__item-catagory"></li>
        {this.renderAccountItems(this.props.accounts)}
        <li className="divider"></li>
      </ul>
    );
  },

  renderAccountItems(accounts) {
    const { identity, accountId } = this.context.params;
    return accounts.map(account => (
      <li className={classNames('account-table__item', { active: account.id === accountId }, 'clearfix')} key={account.id}>
        <Link to={`/${identity}/account/${account.id}/profile`} params={{ id: account.id, identity }}>
          <div className="account-icon left">
            {/* @TODO update the icon with new user icon */}
            <CircleIcon
              size="small"
              backgroundColor="#E33238"
              icon="icon-person"
            />
          </div>

          <div className="account-table__item__username">
            {account.name.firstName} {account.name.lastName}
          </div>
          <div className="account-table__item__email">
            {account.id}
          </div>
        </Link>
      </li>
      )
    );
  },

  render() {
    return (
      <div className="account-table">
        {this.renderHeader()}
        {this.renderSearchBar()}
        {this.renderRoleSections()}
      </div>
    );
  },
});

export default injectIntl(AccountTable);
