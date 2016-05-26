import { isNull, isEmpty } from 'lodash';
import moment from 'moment';
import classNames from 'classnames';
import React, { PropTypes } from 'react';
import Tooltip from 'rc-tooltip';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';

import { getCountryName } from '../../../utils/StringFormatter';
import config from './../../../main/config';
import CountryFlag from '../../../main/components/CountryFlag';
import EmptyRow from '../../../modules/data-table/components/EmptyRow';
import TableHeader from '../../../modules/data-table/components/TableHeader';
import Pagination from '../../../modules/data-table/components/Pagination';

import {
  UI_STATE_LOADING,
  UI_STATE_EMPTY,
  UI_STATE_NORMAL,
  } from '../../../main/constants/uiState';

const { displayDateFormat: DATE_FORMAT } = config;

const MESSAGES = defineMessages({
  dateAndTime: {
    id: 'details.dateAndTime',
    defaultMessage: 'Date & Time',
  },
  type: {
    id: 'type',
    defaultMessage: 'Type / Filesize',
  },
  mobileAndDestination: {
    id: 'details.mobileAndDestination',
    defaultMessage: 'Mobile & Destination',
  },
  status: {
    id: 'status',
    defaultMessage: 'Status',
  },
  amount: {
    id: 'amount',
    defaultMessage: 'Amount',
  },
  remark: {
    id: 'remark',
    defaultMessage: 'Remark',
  },
  systemMessage: {
    id: 'systemMessage',
    defaultMessage: 'System Message',
  },
});

const TABLE_TITLES = [
  '',
  MESSAGES.dateAndTime,
  MESSAGES.type,
  MESSAGES.mobileAndDestination,
  MESSAGES.status,
  MESSAGES.amount,
  MESSAGES.remark,
];

const SMSTable = React.createClass({
  propTypes: {
    records: PropTypes.object,
    intl: PropTypes.object.isRequired,
    page: PropTypes.number,
    totalPage: PropTypes.number,
    onPageLoad: PropTypes.func,
    isLoadingMore: PropTypes.bool,
  },

  _renderCaller(sms) {
    const { intl: { formatMessage } } = this.props;

    if (sms.source_address_inbound) {
      return sms.source_address_inbound;
    }

    if (sms.origin_interface === 'PLATFORM') {
      return formatMessage(MESSAGES.systemMessage);
    }

    return sms.destination_address_inbound;
  },

  _renderStatusLabel(status) {
    if (status.toLowerCase() === 'submitted') {
      return (
        <span className="status-label label radius success">
          <FormattedMessage
            id="submitted"
            defaultMessage="submitted"
          />
        </span>
      );
    }

    return (
      <span className="status-label label radius alert">
        <FormattedMessage
          id="rejected"
          defaultMessage="rejected"
        />
      </span>
    );
  },

  _renderTypeIcon(type) {
    return (
      <Tooltip placement="right" trigger={['hover']} overlay={<span>{type}</span>}>
        <i className={`icon-${type.toLowerCase()}`}></i>
      </Tooltip>
    );
  },

  renderEmptyRow() {
    if (!this.props.records || this.props.records.length === 0) {
      return <EmptyRow colSpan={TABLE_TITLES.length} />;
    }

    return null;
  },

  renderRows(records = []) {
    return records.map(sms =>
      (
        <tr>
          <td className="text-center">
            <span className={classNames(
              'label',
              'status',
              { success: sms.status.toLowerCase() === 'submitted' },
              { alert: sms.status.toLowerCase() === 'rejected' })}
            />
          </td>
          <td className="data-table__datetime">{moment(sms.request_date).format(DATE_FORMAT)}</td>
          <td>
            {this._renderTypeIcon(sms.type2)}
          </td>
          <td>
            <div className="large-24 columns">
              <div className="row">
                <div className="large-11 columns">
                  <div className="caller_info">
                    <div className="left">
                      <span className="caller">{this._renderCaller(sms)}</span>
                    </div>
                  </div>
                </div>
                <div className="large-1 columns">
                  <div className="calls-table__arrow">
                    <i className="icon-arrow" />
                  </div>
                </div>
                <div className="large-11 columns">
                  <div className="callee_info">
                    <CountryFlag className="left" code={sms.country} />
                    <div className="left">
                      <span className="callee">{sms.destination_address_inbound}</span>
                      <br />
                      <span>{getCountryName(sms.country)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </td>
          <td className="status">{this._renderStatusLabel(sms.status)}</td>
          <td>{sms.charged_amount}</td>
          <td>
            <If condition={sms.status.toLowerCase() !== 'submitted' && sms.errorDescription}>
              <Tooltip
                placement="left"
                trigger={['hover']}
                overlay={<span>{sms.errorDescription}</span>}
              >
                <i className="icon-error6" />
              </Tooltip>
            </If>
          </td>
        </tr>
      )
    );
  },

  renderTableBody() {
    const { records } = this.props;

    if (isNull(records)) {
      return (
        <tbody className={UI_STATE_LOADING}>
          <tr>
            <td colSpan={TABLE_TITLES.length}>
              <div className="text-center">
                <FormattedMessage
                  id="loading"
                  defaultMessage="Loading"
                />
                <span>...</span>
              </div>
            </td>
          </tr>
        </tbody>
      );
    }

    if (isEmpty(records)) {
      return <tbody className={UI_STATE_EMPTY}>{this.renderEmptyRow()}</tbody>;
    }

    return <tbody className={UI_STATE_NORMAL}>{this.renderRows(records)}</tbody>;
  },

  render() {
    return (
      <table className="data-table large-24 clickable">
        <TableHeader headers={TABLE_TITLES} />
        {this.renderTableBody()}
        <tfoot>
          <If condition={!isEmpty(this.props.records)}>
            <Pagination
              colSpan={TABLE_TITLES.length + 1}
              hasMoreData={(this.props.totalPage - 1) > this.props.page}
              onLoadMore={this.props.onPageLoad}
              isLoading={this.props.isLoadingMore}
            />
          </If>
        </tfoot>
      </table>
    );
  },
});

export default injectIntl(SMSTable);
