import _ from 'lodash';
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
    totalPage: PropTypes.number,
    onPageLoad: PropTypes.func,
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
    if (!this.props.records || this.props.records.length === 0) {
      return <EmptyRow colSpan={7} />;
    }
  },

  render() {
    const { records } = this.props;

    const rows = records.map(sms =>
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
          <td>{moment(sms.request_date).format(DATE_FORMAT)}</td>
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

    return (
      <table className="data-table large-24 clickable">
        <thead>
          <tr>
            {
              TABLE_TITLES.map(title => <th className="im-table--cell">{title}</th>)
            }
          </tr>
        </thead>
        <tbody>
          {_.isEmpty(rows) ? this.renderEmptyRow() : rows}
        </tbody>
        <tfoot>
          <If condition={!_.isEmpty(this.props.records)}>
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
