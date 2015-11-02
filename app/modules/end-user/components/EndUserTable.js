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
        let country = _.find(Countries, (c) => {
          return c.alpha2.toLowerCase() == u.countryCode
        });

        let creationDate = moment(u.creationDate).format(DATE_FORMAT);
        let handleOnClick = _.bindKey(this.props, 'onUserClick', u.username.trim());

        return <tr onClick={handleOnClick}>
          <td className="text-center"><span className={classNames('label', 'status', { success: u.verified }, { alert: !u.verified })}></span></td>
          <td>
            {u.username}
          </td>
          <td>
            <If condition={country}>
              <div>
                <div className="flag__container left">
                  <span className={classNames('flag--' + country.alpha2, 'left')} />
                </div>
                {country.name}
              </div>

              <Else />

              <div>{NOT_FOUND_LABEL}</div>
            </If>
          </td>
          <td>{u.username}</td>
          <td>{creationDate}</td>
        </tr>
      }
    );

    return (
      <table className="data-table large-24 clickable">
        <thead>
          <tr>
            <th></th>
            <th>Username</th>
            <th>Country</th>
            <th>Mobile</th>
            <th>Date &amp; Time</th>
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="5">
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
