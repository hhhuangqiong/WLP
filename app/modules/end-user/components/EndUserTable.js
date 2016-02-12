import moment from 'moment';
import _ from 'lodash';
import React, { PropTypes } from 'react';
import classNames from 'classnames';

const { displayDateFormat: DATE_FORMAT } = require('./../../../main/config');

const NOT_FOUND_LABEL = 'N/A';
const INACTIVE_ACCOUNT_LABEL = 'Inactive';

const EndUserTable = React.createClass({
  propTypes: {
    users: PropTypes.array,
    hasNext: PropTypes.boolean,
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

  render() {
    const rows = this.props.users.map(u => {
      const device = _.get(u, 'devices.0') || {};

      const creationDate = moment(u.creationDate).format(DATE_FORMAT);
      const handleOnClick = _.bindKey(this.props, 'onUserClick', u.username.trim());

      const platform = device.platform || NOT_FOUND_LABEL;
      const currentUser = this.props.currentUser;

      return (
        <tr className={classNames('end-user-table-row', { selected: currentUser && currentUser.userDetails.username === u.username })} onClick={handleOnClick}>
          <td>{u.jid}</td>
          <td className="creation-date">{creationDate}</td>
          <td className="account-status">
            <span>
              <span className={classNames('label', 'status', (u.accountStatus === 'ACTIVE') ? 'success' : 'alert')}></span>
              {_.capitalize((u.accountStatus || INACTIVE_ACCOUNT_LABEL).toLowerCase())}
            </span>
          </td>
          <td className="device-modal">
            <i className={classNames({'icon-apple': (platform) ? platform.toLowerCase() === 'ios' : false }, {'icon-android': (platform) ? platform.toLowerCase() === 'android' : false })} />
            {device.deviceModel || NOT_FOUND_LABEL}
          </td>
          <td>{device.appBundleId || NOT_FOUND_LABEL}</td>
          <td>{device.appVersionNumber || NOT_FOUND_LABEL}</td>
        </tr>
      );
    });

    return (
      <table className="data-table large-24 clickable">
        <thead>
          <tr>
            <th>Username</th>
            <th>Registration Date</th>
            <th>Account Status</th>
            <th>Latest Device Model</th>
            <th>Bundle ID</th>
            <th>App Version no.</th>
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="7">
              <div className="text-center">
                <If condition={this.props.hasNext}>
                  <span className="pagination__button" onClick={this.props.onPageChange}>Load More</span>
                <Else />
                  <span className="pagination__button pagination__button--inactive">No more</span>
                </If>
            </div>
            </td>
          </tr>
        </tfoot>
      </table>
    );
  },
});

export default EndUserTable;
