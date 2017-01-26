import { isNull, isEmpty } from 'lodash';
import React, { PropTypes } from 'react';
import { FormattedMessage, defineMessages } from 'react-intl';

import VerificationTableRow from './VerificationTableRow';
import VerificationProfile from './VerificationProfile';
import EmptyRow from '../../../modules/data-table/components/EmptyRow';
import TableHeader from '../../../modules/data-table/components/TableHeader';
import Pagination from '../../../modules/data-table/components/Pagination';

import {
  UI_STATE_LOADING,
  UI_STATE_EMPTY,
  UI_STATE_NORMAL,
  } from '../../../main/constants/uiState';

const MESSAGES = defineMessages({
  dateAndTime: {
    id: 'details.dateAndTime',
    defaultMessage: 'Date & Time',
  },
  mobile: {
    id: 'mobile',
    defaultMessage: 'Mobile',
  },
  sourceIp: {
    id: 'vsdk.details.sourceIp',
    defaultMessage: 'Source Ip',
  },
  method: {
    id: 'vsdk.details.method',
    defaultMessage: 'Verification Method',
  },
  os: {
    id: 'os',
    defaultMessage: 'OS',
  },
  deviceModel: {
    id: 'vsdk.details.deviceModel',
    defaultMessage: 'Device Model',
  },
  operator: {
    id: 'vsdk.details.operator',
    defaultMessage: 'Operator',
  },
  result: {
    id: 'result',
    defaultMessage: 'Result',
  },
  remark: {
    id: 'remark',
    defaultMessage: 'Remark',
  },
});

const TABLE_TITLES = [
  MESSAGES.dateAndTime,
  MESSAGES.mobile,
  MESSAGES.sourceIp,
  MESSAGES.method,
  MESSAGES.os,
  MESSAGES.deviceModel,
  MESSAGES.operator,
  MESSAGES.result,
  MESSAGES.remark,
  '',
];

const VerificationTable = React.createClass({
  propTypes: {
    /**
     * Verification records
     * @type {Object[]}
     */
    verifications: PropTypes.array,
    /**
     * Total number of verifications
     * @type {Number}
     */
    total: PropTypes.number.isRequired,
    /**
     * Callback for loading more content
     * @type {Function}
     */
    onLoadMoreClick: PropTypes.func.isRequired,
    isLoadingMore: PropTypes.bool,
  },

  getDefaultProps() {
    return {
      verifications: [],
    };
  },

  getInitialState() {
    return {
      selectedProfile: null,
    };
  },

  onClickProfile(selectedProfile) {
    this.setState({ selectedProfile });
  },

  onClickBackButton() {
    this.setState({ selectedProfile: null });
  },

  renderTableRows(verifications) {
    return verifications.map(item =>
      (
        <VerificationTableRow
          key={item.id}
          verification={item}
          onClickProfile={this.onClickProfile}
        />
      )
    );
  },

  renderEmptyRow() {
    return <EmptyRow colSpan={TABLE_TITLES.length} />;
  },

  renderTableBody() {
    const { verifications } = this.props;

    if (isNull(verifications)) {
      return (
        <tbody className={UI_STATE_LOADING}>
          <tr>
            <td colSpan={TABLE_TITLES.length}>
              <div className="text-center capitalize">
                <FormattedMessage
                  id="loading"
                  defaultMessage="loading"
                />
                <span>...</span>
              </div>
            </td>
          </tr>
        </tbody>
      );
    }

    if (isEmpty(verifications)) {
      return (
        <tbody className={UI_STATE_EMPTY}>{this.renderEmptyRow()}</tbody>
      );
    }

    return (
      <tbody className={UI_STATE_NORMAL}>{this.renderTableRows(verifications)}</tbody>
    );
  },

  renderPaginationFooter() {
    if (this.props.verifications.length < this.props.total) {
      return (
        <div
          className="pagination__button text-center"
          onClick={this.props.onLoadMoreClick}
        >
          <FormattedMessage id="loadMore" defaultMessage="Load More" />
        </div>
      );
    }

    return (
      <div
        className="pagination__button pagination__button--inactive text-center"
      >
        <FormattedMessage id="noMoreResult" defaultMessage="No more result" />
      </div>
    );
  },

  render() {
    const { selectedProfile } = this.state;

    if (!selectedProfile) {
      return (
        <table className="verification-report data-table small-24 large-22 large-offset-1">
          <TableHeader headers={TABLE_TITLES} />
          {this.renderTableBody()}
          <tfoot>
            <If condition={!isEmpty(this.props.verifications)}>
              <Pagination
                colSpan={TABLE_TITLES.length + 1}
                hasMoreData={this.props.verifications.length < this.props.total}
                onLoadMore={this.props.onLoadMoreClick}
                isLoading={this.props.isLoadingMore}
              />
            </If>
          </tfoot>
        </table>
      );
    }

    return (
      <VerificationProfile
        profile={selectedProfile}
        onClickBack={this.onClickBackButton}
      />
    );
  },
});

export default VerificationTable;
