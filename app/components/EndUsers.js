import moment from 'moment';
import {concurrent} from 'contra';

import React from 'react';
import FluxibleMixin from 'fluxible/addons/FluxibleMixin';

import AuthMixin from '../utils/AuthMixin';

import EndUserStore from '../stores/EndUserStore';

import {fetchEndUsers} from '../actions/fetchEndUsers';

import EndUserTable from './EndUserTable';
import EndUserProfile from './EndUserProfile';
import Pagination from './Pagination';

var EndUsers = React.createClass({
  contextTypes: {
    router: React.PropTypes.func.isRequired
  },

  mixins: [FluxibleMixin, AuthMixin],

  statics: {
    storeListeners: [EndUserStore],

    fetchData: function(context, params, query, done) {
      concurrent([
        context.executeAction.bind(context, fetchEndUsers, {
          carrierId: params.identity,
          fromTime: query.fromTime || moment().startOf('day'),
          toTime: query.fromTime || moment().endOf('day'),
          page: query.page || 0
        })
      ], done || function() {});
    }
  },

  getInitialState: function () {
    return {
      current: 1,
      per: 10,
      users: this.getStore(EndUserStore).getUsers(),
      userCount: this.getStore(EndUserStore).getUserCount(),
      currentUser: this.context.router.getCurrentParams().username ? this.getStore(EndUserStore).getCurrentUser() : null
    };
  },

  onChange: function() {
    let state = this.getStore(EndUserStore).getState();
    this.setState(state);
  },

  // PROBLEM:
  // EndUserTable takes current page to display records, but not current record
  // which may induce wired behavior on change in perPage
  getNewCurrentPage(per, nextPer) {
    return Math.ceil(this.state.current * per / nextPer);
  },

  handlePerChange: function(e) {
    let per = e.target.value;
    this.setState({
     current: this.getNewCurrentPage(this.state.per, per),
     per: per
    })
  },

  handlePageChange: function(page) {
    this.setState({
      current: page
    });
  },

  render: function() {
    let userDetails = '';

    if (this.state.currentUser && this.context.router.getCurrentParams().username) {
      userDetails = <EndUserProfile user={this.state.currentUser} />
    }

    return (
      <div className="row">
        <div className="contents-panel info-panel large-18 columns">
          <EndUserTable users={this.state.users} current={this.state.current} per={this.state.per} />
          <Pagination total={this.state.userCount} current={this.state.current} per={this.state.per} onPageChange={this.handlePageChange} />
        </div>
        <div className="large-6 columns">
          {userDetails}
        </div>
      </div>
    );
  }
});

export default EndUsers;
