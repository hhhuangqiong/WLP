import React, { PropTypes } from 'react';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';

import { MESSAGES } from './../constants/i18n';
import Pagination from '../../../main/components/Pagination';

const AccountTable = React.createClass({
  displayName: 'AccountTable',

  propTypes: {
    intl: intlShape.isRequired,
    accounts: PropTypes.array.isRequired,
    handleSearch: PropTypes.func.isRequired,
    pageSize: PropTypes.number,
    page: PropTypes.number,
    totalElements: PropTypes.number,
    handlePageChange: PropTypes.func,
  },

  contextTypes: {
    router: PropTypes.object.isRequired,
    params: PropTypes.object.isRequired,
  },

  renderAccountItems(account) {
    const { identity } = this.context.params;
    const { formatMessage } = this.props.intl;

    return (
      <tr
        onClick={() => this.context.router.push(
          {
            pathname: `/${identity}/account/${encodeURIComponent(account.id)}/profile`,
            params: { id: account.id, identity },
          }
        )}
      >
        <td>{account.name.firstName} {account.name.lastName}</td>
        <td>{account.id}</td>
          { account.isVerified ?
            <td className="complete">
              <span className="circle-button green"></span>{formatMessage(MESSAGES.verified)}
            </td> :
            <td className="status-error">
              <span className="circle-button red"></span>{formatMessage(MESSAGES.notVerified)}
            </td>
          }
      </tr>
    );
  },

  renderPagination() {
    const { pageSize, page, totalElements, handlePageChange } = this.props;
    return (
      <Pagination
        pageSize={pageSize}
        pageNumber={page}
        totalElements={totalElements}
        onChange={handlePageChange}
      />
    );
  },

  render() {
    return (
      <div className="large-24 columns">
        <table className="table__list__item table__list__item--account">
          <thead>
            <tr>
              <th>
                <FormattedMessage id="name" defaultMessage="Name" />
              </th>
              <th>
                <FormattedMessage id="email" defaultMessage="Email" />
              </th>
              <th>
                <FormattedMessage id="status" defaultMessage="Status" />
              </th>
            </tr>
          </thead>
          <tbody>
            {this.props.accounts.map((item, index) => (
              <this.renderAccountItems {...item} key={index} />
            ))}
          </tbody>
        </table>
        {this.renderPagination()}
      </div>
    );
  },
});

export default injectIntl(AccountTable);
