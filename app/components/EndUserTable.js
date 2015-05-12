import React from 'react';
import FluxibleMixin from 'fluxible/addons/FluxibleMixin';
import {NavLink} from 'fluxible-router';

import EndUserStore from '../stores/EndUserStore';

import moment from 'moment';
import _ from 'lodash';

var Countries = require('../data/countries.json');

var EndUserTable = React.createClass({
  mixins: [FluxibleMixin],
  statics: {
    storeListeners: [EndUserStore]
  },
  getInitialState: function () {
    return {
      users:[]
    };
  },
  onChange: function() {
    let state = this.getStore(EndUserStore).getState();
    this.setState(state);
    console.log("changed:", state);
  },
  render: function() {

    // `/w/maaiitest.com/end-users/${u.username}`
    let rows = this.state.users.slice(0, 10).map((u) => {
        let country = _.find(Countries, (c) => {
          return c.alpha2.toLowerCase() == u.countryCode
        });
        let creationDate = moment(u.creationDate).format('MMM. D, YYYY [at] h:mm A z');
        return <tr>
          <td>{u.verified ? "Yes" : "No"}</td>
          <td><NavLink href={'/w/maaiitest.com/end-users/' + u.username}>{u.username}</NavLink></td>
          <td>{country.name}</td>
          <td>{u.username}</td>
          <td>{creationDate}</td>
        </tr>
      }
    );

    return (
      <table className="large-24">
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
