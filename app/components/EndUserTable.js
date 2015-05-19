import React from 'react';
import FluxibleMixin from 'fluxible/addons/FluxibleMixin';
import {Link} from 'react-router';

import EndUserStore from '../stores/EndUserStore';

import moment from 'moment';
import _ from 'lodash';

var Countries = require('../data/countries.json');

var EndUserTable = React.createClass({
  contextTypes: {
    router: React.PropTypes.func.isRequired
  },

  componentWillReceiveProps: function(nextProps) {
    this.props.users = nextProps.users;
    this.props.current = nextProps.current;
    this.props.per = nextProps.per;
  },

  getFirstRecord: function() {
    return (this.props.current - 1) * this.props.per;
  },

  getLastRecord: function() {
    return this.props.current * this.props.per;
  },

  render: function() {
    let params = this.context.router.getCurrentParams();
    // `/w/maaiitest.com/end-users/${u.username}`
    //<td>{u.username}</td>
    //<td><Link href={'/w/maaiitest.com/end-users/' + u.username}>{u.username}</Link></td>
    let rows = this.props.users.slice(this.getFirstRecord(), this.getLastRecord()).map((u) => {
        let country = _.find(Countries, (c) => {
          return c.alpha2.toLowerCase() == u.countryCode
        });
        let creationDate = moment(u.creationDate).format('MMM. D, YYYY [at] h:mm A z');
        return <tr>
          <td className="text-center"><span className={u.verified ? "label status success" : "label status alert"}></span></td>
          <td>
            <Link to="end-user" params={{
              role: params.role,
              identity: params.identity,
              username: u.username
            }}>
              {u.username}
            </Link>
          </td>
          <td>{country.name}</td>
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
      </table>
    );
  }
});

export default EndUserTable;
