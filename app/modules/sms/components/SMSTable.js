import { isNull, isEmpty } from 'lodash';
import moment from 'moment';
import classNames from 'classnames';
import React, { PropTypes } from 'react';
import Tooltip from 'rc-tooltip';

import { getCountryName } from '../../../utils/StringFormatter';
import config from './../../../main/config';
import CountryFlag from '../../../main/components/CountryFlag';
import EmptyRow from '../../../main/components/data-table/EmptyRow';

import Pagination from '../../../main/components/Pagination';

const { displayDateFormat: DATE_FORMAT } = config;
const SYSTEM_MESSAGE_LABEL = 'System Message';

import {
  UI_STATE_LOADING,
  UI_STATE_EMPTY,
  UI_STATE_NORMAL,
} from '../../../main/constants/uiState';

const TABLE_TITLES = [
  '',
  'Date & Time',
  'Type',
  'Mobile/Destination',
  'Status',
  'Amount',
  'Remark',
];

const SMSTable = React.createClass({
  propTypes: {
    records: PropTypes.object,
    page: PropTypes.number,
    totalPages: PropTypes.number,
    onDataLoad: PropTypes.func,
    isLoadingMore: PropTypes.bool,
  },

  _renderCaller(sms) {
    if (sms.source_address_inbound) {
      return sms.source_address_inbound;
    }

    if (sms.origin_interface === 'PLATFORM') {
      return SYSTEM_MESSAGE_LABEL;
    }

    return sms.destination_address_inbound;
  },

  _renderStatusLabel(status) {
    if (status.toLowerCase() === 'submitted') {
      return <span className="status-label label radius success">submitted</span>;
    }

    return <span className="status-label label radius alert">rejected</span>;
  },

  _renderTypeIcon(type) {
    return (
      <Tooltip placement="right" trigger={['hover']} overlay={<span>{type}</span>}>
        <i className={`icon-${type.toLowerCase()}`}></i>
      </Tooltip>
    );
  },

  renderEmptyRow() {
    return <EmptyRow colSpan={TABLE_TITLES.length} />;
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
                <span>Loading...</span>
              </div>
            </td>
          </tr>
        </tbody>
      );
    }

    if (isEmpty(records)) {
      return <tbody className={UI_STATE_EMPTY}>{this.renderEmptyRow()}</tbody>;
    }

    return <tbody className={UI_STATE_NORMAL}>this.renderRows(records)</tbody>;
  },

  render() {
    return (
      <table className="data-table large-24 clickable">
        <thead>
          <tr>
            {
              TABLE_TITLES.map(title => <th className="im-table--cell">{title}</th>)
            }
          </tr>
        </thead>
        {this.renderTableBody()}
        <tfoot>
          <If condition={!isEmpty(this.props.records)}>
            <Pagination
              colSpan={TABLE_TITLES.length + 1}
              hasMoreData={(this.props.totalPages - 1) > this.props.page}
              onLoadMore={this.props.onDataLoad}
              isLoading={this.props.isLoadingMore}
            />
          </If>
        </tfoot>
      </table>
    );
  },
});

export default SMSTable;
