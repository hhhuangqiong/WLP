import React, { PropTypes } from 'react';
import moment from 'moment';
import { injectIntl, intlShape } from 'react-intl';

import { SHORT_DATE_FORMAT } from './../../../utils/timeFormatter';
import Currency from './../../../main/components/Currency';

import { MESSAGES, WALLET_SERVICE_TYPE } from '../constants/companyOptions';

import Pagination from '../../../main/components/Pagination';

function WalletTransactionsTable(props) {
  const {
    intl: { formatMessage },
    contents,
    pageNumber,
    pageSize,
    totalElements,
    onPageChange,
    pageSizeOptions,
  } = props;
  return (
    <table className="company-wallet-table">
      <thead>
      <tr>
        <th>{formatMessage(MESSAGES.date)}</th>
        <th>{formatMessage(MESSAGES.topUpValue)}</th>
        <th>{formatMessage(MESSAGES.balance)}</th>
        <th>{formatMessage(MESSAGES.type)}</th>
        <th>{formatMessage(MESSAGES.description)}</th>
      </tr>
      </thead>
      <tbody>
      {
        contents.map(item =>
          <tr key={item.transactionId}>
            <td>{moment(item.transactionDate).format(SHORT_DATE_FORMAT)}</td>
            <td>
              <Currency currencyCode={item.currency} amount={item.amount} />
            </td>
            <td>
              <Currency currencyCode={item.currency} amount={item.balance} />
            </td>
            <td>
              {formatMessage(MESSAGES[item.type] || { id: item.type })}
            </td>
            <td>{item.description}</td>
          </tr>
        )
      }
      </tbody>
      <tfoot>
      <tr>
        <td colSpan="5">
          <Pagination
            pageNumber={pageNumber}
            pageSize={pageSize}
            totalElements={totalElements}
            onChange={onPageChange}
            pageSizeOptions={pageSizeOptions}
          />
        </td>
      </tr>
      </tfoot>
    </table>
  );
}
WalletTransactionsTable.propTypes = {
  intl: intlShape.isRequired,
  pageNumber: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
  totalElements: PropTypes.number.isRequired,
  contents: PropTypes.arrayOf(PropTypes.shape({
    date: PropTypes.date,
    amount: PropTypes.string,
    currency: PropTypes.number,
    description: PropTypes.string,
    type: PropTypes.oneOf(Object.values(WALLET_SERVICE_TYPE)),
    transactionId: PropTypes.string,
  })),
  onPageChange: PropTypes.func,
  pageSizeOptions: PropTypes.arrayOf(PropTypes.number),
};

export default injectIntl(WalletTransactionsTable);
