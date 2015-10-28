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
        });

        let creationDate = moment(u.creationDate).format(DATE_FORMAT);
        let handleOnClick = _.bindKey(this.props, 'onUserClick', u.username.trim());

        let platform = device.platform || NOT_FOUND_LABEL;

        return <tr onClick={handleOnClick}>
          <td>
            {u.username}
          </td>
          <td>{creationDate}</td>
          <td className="account-status">
            <span>
              <span className={classNames('label', 'status', (u.accountStatus === 'ACTIVE')?'success':'alert')}></span>
              {_.capitalize(u.accountStatus.toLowerCase())}
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
            <th>Mobile no.</th>
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
              <If condition={this.props.hasNext}>
                <div className="text-center">
                  <span className="pagination__button" onClick={this.props.onPageChange}>Load More</span>
                </div>
              </If>
            </td>
          </tr>
        </tfoot>
      </table>
    );
  }
});

export default EndUserTable;
