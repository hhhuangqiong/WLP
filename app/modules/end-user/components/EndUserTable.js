import React, { PropTypes } from 'react';
import FluxibleMixin from 'fluxible/addons/FluxibleMixin';
import {Link} from 'react-router';
import classNames from 'classnames';

import EndUserStore from '../stores/EndUserStore';

import moment from 'moment';
import _ from 'lodash';

const { displayDateFormat: DATE_FORMAT } = require('./../../../main/config');
const Countries = require('../../../data/countries.json');
const NOT_FOUND_LABEL = 'N/A';

var EndUserTable = React.createClass({
  contextTypes: {
    router: PropTypes.func.isRequired
  },

  PropTypes: {
    users: PropTypes.array,
    hasNext: PropTypes.boolean,
    onUserClick: PropTypes.func,
    onPageChange: PropTypes.func.isRequired
  },

  getDefaultProps: function() {
    return {
      users: [],
      hasNext: false
    };
  },

  render: function() {
    let rows = this.props.users.map((u) => {
      let device = _.get(u, 'devices.0') || {};

        let country = _.find(Countries, (c) => {
          return c.alpha2.toLowerCase() == u.countryCode
        }) || {
          name: NOT_FOUND_LABEL,
          alpha2: NOT_FOUND_LABEL
        };

        let creationDate = moment(u.creationDate).format(DATE_FORMAT);
        let handleOnClick = _.bindKey(this.props, 'onUserClick', u.username.trim());

        let platform = device.platform || NOT_FOUND_LABEL;
        let currentUser = this.props.currentUser;

        return <tr className={classNames('end-user-table-row', { selected: currentUser && currentUser.userDetails.username === u.username })} onClick={handleOnClick}>
          <td>
            {u.jid}
          </td>
          <td className="creation-date">{creationDate}</td>
          <td className="account-status">
            <span>
              <span className={classNames('label', 'status', (u.accountStatus === 'ACTIVE')?'success':'alert')}></span>
              {_.capitalize((u.accountStatus || '').toLowerCase())}
            </span>
          </td>
          <td className="device-modal">
            <i className={classNames({'icon-apple': (platform) ? platform.toLowerCase() === 'ios' : false }, {'icon-android': (platform) ? platform.toLowerCase() === 'android' : false })} />
            {device.deviceModel || NOT_FOUND_LABEL}
          </td>
          <td>{device.appBundleId || NOT_FOUND_LABEL}</td>
          <td>{device.appVersionNumber || NOT_FOUND_LABEL}</td>
        </tr>
      }
    );

    return (
      <table className="data-table large-24 clickable">
        <thead>
          <tr>
            <th>Username</th>
            <th>Registration Date</th>
            <th>Account Status</th>
            <th>Device Model</th>
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
  }
});

export default EndUserTable;
