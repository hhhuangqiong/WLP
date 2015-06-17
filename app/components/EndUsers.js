import _ from 'lodash';
import moment from 'moment';
import {concurrent} from 'contra';

import React from 'react';
import FluxibleMixin from 'fluxible/addons/FluxibleMixin';
import DatePicker from 'react-datepicker';

import AuthMixin from '../utils/AuthMixin';

import EndUserStore from '../stores/EndUserStore';

import fetchEndUser from '../actions/fetchEndUser';
import fetchEndUsers from '../actions/fetchEndUsers';
import clearEndUsers from '../actions/clearEndUsers';

import EndUserTable from './EndUserTable';
import EndUserProfile from './EndUserProfile';
import Pagination from './Pagination';

var EndUsers = React.createClass({
  contextTypes: {
    executeAction: React.PropTypes.func.isRequired,
    router: React.PropTypes.func.isRequired
  },

  mixins: [FluxibleMixin, AuthMixin],

  statics: {
    storeListeners: [EndUserStore],

    fetchData: function(context, params, query, done) {
      concurrent([
        context.executeAction.bind(context, fetchEndUsers, {
          carrierId: params.identity,
          fromTime: query.fromTime || moment().startOf('day').format('L'),
          toTime: query.toTime || moment().endOf('day').format('L'),
          pageNumberIndex: query.page ? Math.floor(query.page/1000) : 0
        })
      ], done || function() {});
    }
  },

  getInitialState: function () {
    let query = _.merge({
      current: 1,
      per: 10,
      fromTime: moment().startOf('day').format('L'),
      toTime: moment().endOf('day').format('L')
    }, this.context.router.getCurrentQuery());

    return _.merge(this.getStateFromStore(), query);
  },

  getStateFromStore: function() {
    return {
      users: this.getStore(EndUserStore).getUsers(),
      hasNextPage: this.getStore(EndUserStore).getHasNextPage(),
      currentUser: this.context.router.getCurrentParams.username ? this.getStore(EndUserStore).getCurrentUser() : null
    };
  },

  onChange: function() {
    let state = this.getStore(EndUserStore).getState();
    this.setState(state);
  },

  getQueryFromState: function() {
    return {
      fromTime: this.state.fromTime && this.state.fromTime.trim(),
      toTime: this.state.toTime && this.state.toTime.trim()
    }
  },

  handleUserClick: function(username) {
    let routeName = _.last(this.context.router.getCurrentRoutes()).name;
    let params = this.context.router.getCurrentParams();
    let query = this.context.router.getCurrentQuery();

    this.context.executeAction(fetchEndUser, {
      carrierId: params.identity,
      username: username
    });

    //comment this out for now
    //may need it in the future
    //this.context.router.replaceWith(routeName, params, _.merge(query, {
    //  currentUser: username
    //}));
  },

  /**
   * handleQueryChange
   * this is for changes in either startDate/formTime or endDate/toTime
   * upon query changes, the data in store should be cleared
   *
   * @param newQuery Object
   */
  handleQueryChange: function(newQuery) {
    let routeName = _.last(this.context.router.getCurrentRoutes()).name;
    let params = this.context.router.getCurrentParams();
    let query = _.merge(this.context.router.getCurrentQuery(), this.getQueryFromState(), newQuery);

    this.context.executeAction(clearEndUsers, {
      routeName: routeName,
      params: params,
      query: query
    });

    // reset pagination
    this.setState({
      current: 1
    });
  },

  handleStartDateChange: function(momentDate) {
    let date = moment(momentDate).format('L');
    this.handleQueryChange({ fromTime: date, pageNumberIndex: 0 });
  },

  handleEndDateChange: function(momentDate) {
    let date = moment(momentDate).format('L');
    this.handleQueryChange({ toTime: date, pageNumberIndex: 0 });
  },

  _handleStartDateClick: function() {
    this.refs.startDatePicker.handleFocus();
  },

  _handleEndDateClick: function() {
    this.refs.endDatePicker.handleFocus();
  },

  handlePageChange: function(page) {
    let lastPage = this.refs.endUserTable.refs.pagination.getLastPage();
    let params = this.context.router.getCurrentParams();
    let query = this.context.router.getCurrentQuery();

    if (page == lastPage && this.state.hasNextPage) {
      this.executeAction(fetchEndUsers, {
        carrierId: params.identity,
        fromTime: query.fromTime,
        toTime: query.toTime,
        pageNumberIndex: Math.floor(page * this.state.per)/1000
      })
    }

    this.setState({
      current: page,
      currentUser: null
    });
  },

  render: function() {
    return (
      <div className="row">
        <nav className="top-bar top-bar--inner" data-topbar role="navigation">
          <ul className="left top-bar--inner">
            <li className="top-bar--inner">
              <div className="date-range-picker left">
                <i className="date-range-picker__icon icon-calendar left" />
                <div className="date-input-wrap left" onClick={this._handleStartDateClick}>
                  <span className="left date-range-picker__date-span">{this.state.fromTime}</span>
                  <DatePicker
                    ref="startDatePicker"
                    key="start-date"
                    dateFormat="MM/DD/YYYY"
                    selected={moment(this.state.fromTime, 'L')}
                    maxDate={moment(this.state.toTime, 'L')}
                    onChange={this.handleStartDateChange}
                    />
                </div>
                <i className="date-range-picker__separator left">-</i>
                <div className="date-input-wrap left" onClick={this._handleEndDateClick}>
                  <span className="left date-range-picker__date-span">{this.state.toTime}</span>
                  <DatePicker
                    ref="endDatePicker"
                    key="end-date"
                    dateFormat="MM/DD/YYYY"
                    selected={moment(this.state.toTime, 'L')}
                    minDate={moment(this.state.fromTime, 'L')}
                    onChange={this.handleEndDateChange}
                    />
                </div>
              </div>
            </li>
          </ul>
        </nav>
        <div className="large-24 columns">
          <div className="large-16 columns">
            <EndUserTable
              ref="endUserTable"
              users={this.state.users}
              total={this.state.users && this.state.users.length}
              current={this.state.current}
              per={this.state.per}
              onUserClick={this.handleUserClick}
              onPageChange={this.handlePageChange}
            />
          </div>
          <div className="large-8 columns">
            <If condition={this.state.currentUser}>
              <EndUserProfile user={this.state.currentUser} />
            </If>
          </div>
        </div>
      </div>
    );
  }
});

export default EndUsers;
