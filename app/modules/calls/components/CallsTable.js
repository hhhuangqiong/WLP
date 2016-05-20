import React, { PropTypes } from 'react';
import classNames from 'classnames';
import moment from 'moment';
import { isEmpty, isNull } from 'lodash';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';

import i18nMessages from '../../../main/constants/i18nMessages';
import Pagination from '../../../modules/data-table/components/Pagination';
import { parseDuration } from '../../../utils/StringFormatter';
import { getCountryName } from '../../../utils/StringFormatter';
import CountryFlag from '../../../main/components/CountryFlag';
import EmptyRow from '../../../modules/data-table/components/EmptyRow';
import TableHeader from '../../../modules/data-table/components/TableHeader';

const EMPTY_STRING = i18nMessages.unknownLabel;

const DATE_FORMAT = 'MMMM DD YYYY';
const TIME_FORMAT = 'H:mm:ss';

const MESSAGES = defineMessages({
  caller: {
    id: 'calls.details.caller',
    defaultMessage: 'Caller',
  },
  callee: {
    id: 'calls.details.callee',
    defaultMessage: 'Callee',
  },
  callDuration: {
    id: 'calls.details.callDuration',
    defaultMessage: 'Call Duration',
  },
  date: {
    id: 'date',
    defaultMessage: 'Date',
  },
  status: {
    id: 'status',
    defaultMessage: 'Status',
  },
  lastReponseCode: {
    id: 'calls.details.lastReponseCode',
    defaultMessage: 'Last Response Code',
  },
  byeReason: {
    id: 'calls.details.byeReason',
    defaultMessage: 'Bye Reason',
  },
  releaseParty: {
    id: 'calls.details.releaseParty',
    defaultMessage: 'Release Party',
  },
});

const TABLE_TITLES = [
  MESSAGES.caller,
  MESSAGES.callee,
  MESSAGES.callDuration,
  MESSAGES.date,
  MESSAGES.status,
  MESSAGES.lastReponseCode,
  MESSAGES.byeReason,
  MESSAGES.releaseParty,
];

import {
  UI_STATE_LOADING,
  UI_STATE_EMPTY,
  UI_STATE_NORMAL,
} from '../../../main/constants/uiState';

const CallsTable = React.createClass({
  propTypes: {
    calls: PropTypes.array.isRequired,
    totalPages: PropTypes.number.isRequired,
    page: PropTypes.number.isRequired,
    onDataLoad: PropTypes.func.isRequired,
    isLoadingMore: PropTypes.bool,
    intl: PropTypes.object.isRequired,
  },

  contextTypes: {
    router: PropTypes.object.isRequired,
  },

  renderCountryField(number, countryCode, callType = 'caller') {
    // Prevent display carrier
    number = number.split('@')[0];

    if (!countryCode) {
      return <span className={`data-table__${callType}`}>{number}</span>;
    }

    // Get the actual country name
    const countryName = getCountryName(countryCode);

    return (
      <div className="caller_info">
        <CountryFlag className="left" code={countryCode} />
        <div className="left">
          <span className={`data-table__${callType}`}>{number}</span>
          <br />
          <span>{countryName}</span>
        </div>
      </div>
    );
  },

  renderEmptyRow() {
    return <EmptyRow colSpan={TABLE_TITLES.length} />;
  },

  getCallStatus(success) {
    if (success) {
      return (
        <FormattedMessage
          id="success"
          defaultMessage="Success"
        />
      );
    }

    return (
      <FormattedMessage
        id="failure"
        defaultMessage="Failure"
      />
    );
  },

  getReleaseParty(releaseParty) {
    if (releaseParty === 'Caller') {
      return (
        <FormattedMessage
          id="calls.details.caller"
          defaultMessage="Caller"
        />
      );
    }

    if (releaseParty === 'Inter-release') {
      return (
        <FormattedMessage
          id="calls.details.interRelease"
          defaultMessage="Inter-release"
        />
      );
    }

    return releaseParty;
  },

  renderRows(records = []) {
    const { intl: { formatMessage } } = this.props;

    return records.map(u => {
      const callStartDate = moment(u.start_time).format(DATE_FORMAT);
      const callEndDate = (u.end_time > 0) ?
        moment(u.end_time).format(DATE_FORMAT) :
        callStartDate;

      const callStartTime = moment(u.start_time).format(TIME_FORMAT);
      const callEndTime = (u.end_time > 0) ?
        moment(u.end_time).format(TIME_FORMAT) :
        callStartTime;

      return (
        <tr key={u.record_id}>
          <td>
            {this.renderCountryField(u.caller, u.source_country_tel_code)}
          </td>
          <td>{this.renderCountryField(u.callee, u.target_country_tel_code, 'callee')}</td>
          <td><span className="left duration">{parseDuration(u.duration)}</span></td>

          <td>
            <div>
              <span className="data-table__datetime">{callEndDate}</span>
              <span>,</span>
            </div>
            <span className="call_time">{callStartTime} - {callEndTime}</span>
          </td>

          <td>
            <span
              className={classNames('call_status', u.success ? 'success' : 'alert')}
            >
              {this.getCallStatus(u.success)}
            </span>
          </td>
          <td>
            <span className="last_response_code">
              {u.last_response_code || formatMessage(EMPTY_STRING)}
            </span>
          </td>
          <td>
            <div className="call_by_reason">{u.bye_reason || formatMessage(EMPTY_STRING)}</div>
          </td>
          <td>
            <span>{this.getReleaseParty(u.release_party) || formatMessage(EMPTY_STRING)}</span>
          </td>
        </tr>
      );
    });
  },

  renderTableBody(content) {
    if (isNull(content)) {
      return (
        <tbody className={UI_STATE_LOADING}>
          <tr>
            <td colSpan={TABLE_TITLES.length}>
              <div className="text-center">
                <span>
                  <FormattedMessage
                    id="loading"
                    defaultMessage="Loading"
                  />
                  <span>...</span>
                </span>
              </div>
            </td>
          </tr>
        </tbody>
      );
    }

    if (isEmpty(content)) {
      return (
        <tbody className={UI_STATE_EMPTY}>{this.renderEmptyRow()}</tbody>
      );
    }

    return (
      <tbody className={UI_STATE_NORMAL}>{this.renderRows(content)}</tbody>
    );
  },

  renderTableFoot() {
    if (!this.props.calls || isEmpty(this.props.calls)) {
      return null;
    }

    return (
      <tfoot>
        <Pagination
          colSpan={TABLE_TITLES.length + 1}
          hasMoreData={(this.props.totalPages - 1) > this.props.page}
          onLoadMore={this.props.onDataLoad}
          isLoading={this.props.isLoadingMore}
        />
      </tfoot>
    );
  },

  render() {
    return (
      <table className="large-24 clickable data-table" key="calls-table">
        <TableHeader headers={TABLE_TITLES} />
        {this.renderTableBody(this.props.calls)}
        {this.renderTableFoot()}
      </table>
    );
  },
});

export default injectIntl(CallsTable);
