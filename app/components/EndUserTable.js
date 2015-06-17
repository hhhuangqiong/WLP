import React from 'react';
import FluxibleMixin from 'fluxible/addons/FluxibleMixin';
import {Link} from 'react-router';
import classNames from 'classnames';

import EndUserStore from '../stores/EndUserStore';
import Pagination from '../components/Pagination';

import moment from 'moment';
import _ from 'lodash';

var Countries = require('../data/countries.json');

var EndUserTable = React.createClass({
  contextTypes: {
    router: React.PropTypes.func.isRequired
  },

  getDefaultProps: function() {
    return {
      users: []
    };
  },

  getFirstRecord: function() {
    return (this.props.current - 1) * this.props.per;
  },

  getLastRecord: function() {
    return this.props.current * this.props.per;
  },

  render: function() {
    let rows = this.props.users.slice(this.getFirstRecord(), this.getLastRecord()).map((u) => {
        let country = _.find(Countries, (c) => {
          return c.alpha2.toLowerCase() == u.countryCode
        });
        let creationDate = moment(u.creationDate).format('MMMM DD, YYYY h:mm:ss a');
        let handleOnClick = _.bindKey(this.props, 'onUserClick', u.username.trim());
        return <tr onClick={handleOnClick}>
          <td className="text-center"><span className={u.verified ? "label status success" : "label status alert"}></span></td>
          <td>
            {u.username}
          </td>
          <td>
            <div className="flag__container left">
              <span className={classNames('flag--' + country.alpha2, 'left')} />
            </div>
            {country.name}
          </td>
          <td>{u.username}</td>
          <td>{creationDate}</td>
        </tr>
      }
    );

    return (
      <table className="large-24 clickable">
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
              <Pagination
                ref="pagination"
                total={this.props.total}
                current={this.props.current}
                per={this.props.per}
                onPageChange={this.props.onPageChange}
              />
            </td>
          </tr>
        </tfoot>
      </table>
    );
  }
});

export default EndUserTable;
