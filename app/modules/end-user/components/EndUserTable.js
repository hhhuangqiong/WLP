import moment from 'moment';
import { get, bindKey, isNull, isEmpty, capitalize } from 'lodash';
import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { FormattedMessage } from 'react-intl';

import EmptyRow from '../../../main/components/data-table/EmptyRow';

import Pagination from '../../../main/components/Pagination';

const { displayDateFormat: DATE_FORMAT } = require('./../../../main/config');

const NOT_FOUND_LABEL = 'N/A';
const INACTIVE_ACCOUNT_LABEL = 'Inactive';

const TABLE_TITLES_IDS = [
  'username',
  'endUser.details.registrationDate',
  'endUser.details.accountStatus',
  'endUser.details.latestDeviceModel',
  'buildId',
  'endUser.details.appVersion',
];

import {
  UI_STATE_LOADING,
  UI_STATE_EMPTY,
  UI_STATE_NORMAL,
} from '../../../main/constants/uiState';

const EndUserTable = React.createClass({
  propTypes: {
    users: PropTypes.array,
    hasNext: PropTypes.bool,
    onUserClick: PropTypes.func,
    onPageChange: PropTypes.func.isRequired,
    currentUser: PropTypes.object.isRequired,
  },

  contextTypes: {
    router: PropTypes.func.isRequired,
  },

  getDefaultProps() {
    return {
      users: [],
      hasNext: false,
    };
  },

  renderEmptyRow() {
    if (!this.props.users || this.props.users.length === 0) {
      return <EmptyRow colSpan={7} />;
    }
  },

  renderTableFooterContent() {
    if (this.props.hasNext) {
      return (
        <div className="text-center">
          <span className="pagination__button" onClick={this.props.onPageChange}>
            <FormattedMessage id="loadMore" defaultMessage="Load More" />
          </span>
        </div>
      );
    }

    return (
      <div className="text-center">
        <span className="pagination__button pagination__button--inactive">
		  <FormattedMessage id="noMoreResult" defaultMessage="No more result" />
		</span>
      </div>
    );
  },

  renderTableBody(content) {
    if (isNull(content)) {
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

    if (isEmpty(content)) {
      return (
        <tbody className={UI_STATE_EMPTY}>
          <EmptyRow colSpan={TABLE_TITLES.length} />
        </tbody>
      );
    }

    return (
      <tbody className={UI_STATE_NORMAL}>{this.renderRows(content)}</tbody>
    );
  },

  renderRows(content) {
    return content.map(u => {
      const device = get(u, 'devices.0') || {};

      const creationDate = moment(u.creationDate).format(DATE_FORMAT);
      const handleOnClick = bindKey(this.props, 'onUserClick', u.username.trim());

      const platform = device.platform || NOT_FOUND_LABEL;
      const currentUser = this.props.currentUser;

      return (
        <tr
          className={
            classNames(
              'end-user-table-row',
              { selected: currentUser && currentUser.userDetails.username === u.username }
            )
          }
          onClick={handleOnClick}
        >
          <td>{u.jid}</td>
          <td className="data-table__datetime">{creationDate}</td>
          <td className="account-status">
            <span>
              <span
                className={classNames(
                  'label',
                  'status',
                  (u.accountStatus === 'ACTIVE') ? 'success' : 'alert'
                )}
              ></span>
              {capitalize((u.accountStatus || INACTIVE_ACCOUNT_LABEL).toLowerCase())}
            </span>
          </td>
          <td className="device-modal">
            <i className={classNames(
              { 'icon-apple': (platform) ? platform.toLowerCase() === 'ios' : false },
              { 'icon-android': (platform) ? platform.toLowerCase() === 'android' : false })}
            />
            {device.deviceModel || NOT_FOUND_LABEL}
          </td>
          <td>{device.appBundleId || NOT_FOUND_LABEL}</td>
          <td>{device.appVersionNumber || NOT_FOUND_LABEL}</td>
        </tr>
      );
    });
  },

  render() {
    return (
      <table className="data-table large-24 clickable">
        <thead>
          <tr>
            {
              TABLE_TITLES_IDS.map(id => (
                <th className="im-table--cell">
                  <FormattedMessage id={id} />
                </th>
              ))
            }
          </tr>
        </thead>
        {this.renderTableBody(this.props.users)}
        <tfoot>
          <If condition={!isEmpty(this.props.users)}>
            <Pagination
              colSpan={TABLE_TITLES_IDS.length + 1}
              hasMoreData={this.props.hasNext}
              onLoadMore={this.props.onPageChange}
            />
          </If>
        </tfoot>
      </table>
    );
  },
});

export default EndUserTable;
