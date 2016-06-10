import moment from 'moment';
import { get, bindKey, isNull, isEmpty, capitalize } from 'lodash';
import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';

import EmptyRow from '../../../modules/data-table/components/EmptyRow';
import TableHeader from '../../../modules/data-table/components/TableHeader';
import Pagination from '../../../modules/data-table/components/Pagination';
import i18nMessages from '../../../main/constants/i18nMessages';
import Icon from '../../../main/components/Icon';
import * as dateLocale from '../../../utils/dateLocale';

import getPlatformInfo from '../utils/getPlatformInfo.js';

const { displayDateFormat: DATE_FORMAT } = require('./../../../main/config');

const ACTIVE_STATUS = 'active';

const MESSAGES = defineMessages({
  username: {
    id: 'username',
    defaultMessage: 'Username',
  },
  registrationDate: {
    id: 'endUser.details.registrationDate',
    defaultMessage: 'Registration Date',
  },
  accountStatus: {
    id: 'endUser.details.accountStatus',
    defaultMessage: 'Account Status',
  },
  latestDeviceModel: {
    id: 'endUser.details.latestDeviceModel',
    defaultMessage: 'Latest Device Model',
  },
  buildId: {
    id: 'buildId',
    defaultMessage: 'Build Id',
  },
  appVersion: {
    id: 'endUser.details.appVersion',
    defaultMessage: 'App Version',
  },
  active: {
    id: 'active',
    defaultMessage: 'Active',
  },
  inactive: {
    id: 'inactive',
    defaultMessage: 'Inactive',
  },
});

const NOT_FOUND_LABEL = i18nMessages.unknownLabel;

const TABLE_TITLES = [
  MESSAGES.username,
  MESSAGES.registrationDate,
  MESSAGES.accountStatus,
  MESSAGES.latestDeviceModel,
  MESSAGES.buildId,
  MESSAGES.appVersion,
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
    intl: PropTypes.object.isRequired,
  },

  contextTypes: {
    router: PropTypes.object.isRequired,
  },

  getDefaultProps() {
    return {
      users: [],
      hasNext: false,
    };
  },

  renderEmptyRow() {
    if (!this.props.users || this.props.users.length === 0) {
      return <EmptyRow colSpan={TABLE_TITLES.length} />;
    }

    return null;
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

  renderTableBody(content, isLoading) {
    if (isEmpty(content)) {
      return isLoading ? (
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
      ) : (
        <tbody className={UI_STATE_EMPTY}>
          <EmptyRow colSpan={TABLE_TITLES.length} />
        </tbody>
      );
    }

    return (
      <tbody className={UI_STATE_NORMAL}>{this.renderRows(content)}</tbody>
    );
  },

  getAccountStatus(accountStatus) {
    const { intl: { formatMessage } } = this.props;

    if (!accountStatus) {
      return formatMessage(NOT_FOUND_LABEL);
    }

    if (accountStatus.toLowerCase() === ACTIVE_STATUS) {
      return capitalize(formatMessage(MESSAGES.active));
    }

    return formatMessage(MESSAGES.inactive);
  },

  renderRows(content) {
    const { intl: { formatMessage } } = this.props;

    return content.map(u => {
      const device = get(u, 'devices.0') || {};

      const creationDate = dateLocale.format(moment(u.creationDate), DATE_FORMAT);
      const handleOnClick = bindKey(this.props, 'onUserClick', u.username.trim());

      const platform = device.platform || formatMessage(NOT_FOUND_LABEL);
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
              {this.getAccountStatus(u.accountStatus)}
            </span>
          </td>
          <td className="device-modal">
            <Icon symbol={getPlatformInfo(platform).iconClass} />
            {device.deviceModel || formatMessage(NOT_FOUND_LABEL)}
          </td>
          <td>{device.appBundleId || formatMessage(NOT_FOUND_LABEL)}</td>
          <td>{device.appVersionNumber || formatMessage(NOT_FOUND_LABEL)}</td>
        </tr>
      );
    });
  },

  render() {
    return (
      <table className="data-table large-24 clickable">
        <TableHeader headers={TABLE_TITLES} />
        {this.renderTableBody(this.props.users, this.props.isLoading)}
        <tfoot>
        {
          !isEmpty(this.props.users) ? (
            <Pagination
              colSpan={TABLE_TITLES.length + 1}
              hasMoreData={this.props.hasNext}
              onLoadMore={this.props.onPageChange}
              isLoading={this.props.isLoading}
            />
          ) : null
        }
        </tfoot>
      </table>
    );
  },
});

export default injectIntl(EndUserTable);
