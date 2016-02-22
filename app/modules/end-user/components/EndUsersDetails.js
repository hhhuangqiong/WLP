import _ from 'lodash';
import moment from 'moment';
import {concurrent} from 'contra';

import React from 'react';
import { Link } from 'react-router';
import FluxibleMixin from 'fluxible/addons/FluxibleMixin';

import AuthMixin from '../../../utils/AuthMixin';

import EndUserStore from '../stores/EndUserStore';

import fetchEndUser from '../actions/fetchEndUser';
import fetchEndUsers from '../actions/fetchEndUsers';
import clearEndUsers from '../actions/clearEndUsers';
import showNextPage from '../actions/showNextPage';

import * as FilterBar from './../../../main/components/FilterBar';
import DateRangePicker from './../../../main/components/DateRangePicker';
import Export from './../../../main/file-export/components/Export';

import EndUserTable from './EndUserTable';
import EndUserProfile from './EndUserProfile';
import EndUserExportForm from './EndUserExportForm';

import config from './../../../main/config';

const { inputDateFormat: DATE_FORMAT } = config;
const { pages: { endUser: { pageRec: PAGE_REC } } } = config;

// See: https://issuetracking.maaii.com:9443/display/MAAIIP/MUMS+User+Management+by+Carrier+HTTP+API
// page = 0 1st page
const INITIAL_PAGE_NUMBER = 0;
const MONTHS_BEFORE_TODAY = 1;

function getInitialQueryFromURL(params, query = {}) {
  return {
    carrierId: params.identity,
    startDate: query.startDate,
    endDate: query.endDate,
    bundleId: query.bundleId,
    status: query.status,
    page: query.page
  };
}

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
        context.executeAction.bind(context, clearEndUsers)
      ], done || function() {});
    }
  },

  getInitialState: function() {
    return _.merge(_.clone(this.getDefaultQuery()), this.getRequestBodyFromQuery(), this.getStateFromStores());
  },

  getDefaultQuery() {
    return {
      carrierId: null,
      startDate: moment().startOf('day').subtract(MONTHS_BEFORE_TODAY, 'month').format(DATE_FORMAT),
      endDate: moment().endOf('day').format(DATE_FORMAT),
      page: INITIAL_PAGE_NUMBER
    };
  },

  componentDidMount: function() {
    this.executeAction(fetchEndUsers, _.merge(_.clone(this.getDefaultQuery()), this.getRequestBodyFromState(), this.getStateFromStores()));
  },

  componentDidUpdate: function(prevProps, prevState) {
    // @TODO should not update userList here, need to change it later or perhaps call within `fetchData`?
    this.loadUserList(prevState);
  },

  loadFirstUserDetail: function() {
    let users = this.getStore(EndUserStore).getDisplayUsers();
    let currentUser = this.getStore(EndUserStore).getCurrentUser();
    if (!_.isEmpty(users) && _.isEmpty(currentUser)) {
      let {username} = users[0];
      this.handleUserClick(username);
    }
  },

  loadUserList: function(prevState) {
    let prevStartDate = prevState.startDate;
    let prevEndDate = prevState.endDate;
    let nextStartDate = this.getRequestBodyFromQuery().startDate;
    let nextEndDate = this.getRequestBodyFromQuery().endDate;
    if ( nextStartDate && nextEndDate && (prevStartDate !== nextStartDate || prevEndDate !== nextEndDate) ) {
      this.executeAction(fetchEndUsers, _.merge(_.clone(this.getDefaultQuery()), this.getRequestBodyFromState(), this.getRequestBodyFromQuery()));
    }
  },

  getRequestBodyFromQuery: function(query) {
    let { startDate, endDate, page } = query || this.context.router.getCurrentQuery();
    return { startDate, endDate, page };
  },

  getRequestBodyFromState: function() {
    let { identity } = this.context.router.getCurrentParams();
    let { startDate, endDate, page } = this.state;
    return { carrierId: identity, startDate, endDate, page };
  },

  getStateFromStores: function() {
    return {
      page: this.getStore(EndUserStore).getPage(),
      hasNextPage: this.getStore(EndUserStore).getHasNextPage(),
      currentUser: this.context.router.getCurrentParams.username ? this.getStore(EndUserStore).getCurrentUser() : null
    };
  },

  onChange: function() {
    this.setState(this.getStateFromStores());
    this.loadFirstUserDetail();
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
    let query = _.merge(this.getRequestBodyFromQuery(), this.getRequestBodyFromState(), newQuery);

    this.context.router.transitionTo(routeName, params, _.omit(query, function(value) {
      return !value;
    }));
  },

  handleStartDateChange: function(momentDate) {
    let date = moment(momentDate).format(DATE_FORMAT);
    this.setState({ startDate: date });
    this.handleQueryChange({ startDate: date, page: INITIAL_PAGE_NUMBER });
  },

  handleEndDateChange: function(momentDate) {
    let date = moment(momentDate).format(DATE_FORMAT);
    this.setState({ endDate: date });
    this.handleQueryChange({ endDate: date, page: INITIAL_PAGE_NUMBER });
  },

  handleShowNextPage: function() {
    this.context.executeAction(showNextPage);

    if (this.getStore(EndUserStore).getNeedMoreData()) {
      let params = this.context.router.getCurrentParams();
      this.context.executeAction(fetchEndUsers, {
        carrierId: params.identity,
        startDate: this.state.startDate,
        endDate: this.state.endDate,
        page: this.state.page + 1
      });
    }
  },

  handleUserClick: function(username) {
    let { identity: carrierId } = this.context.router.getCurrentParams();

    this.context.executeAction(fetchEndUser, {
      carrierId: carrierId,
      username: username
    });
  },

  handleBundleIdChange: function(e) {
    let query = { bundleId: e.target.value };
    this.setState(query);
  },

  handleStatusChange: function(e) {
    let query = { status: e.target.value };
    this.setState(query);
  },

  applyFilters: function(users) {
    if (this.state.bundleId) {
      users = _.filter(users, (user)=> {
        let device = _.get(user, 'devices.0') || {};
        return device.appBundleId === this.state.bundleId;
      });
    }
    if (this.state.status) {
      users = _.filter(users, (user)=> {
        return user.accountStatus === this.state.status;
      });
    }
    return users;
  },

  _checkHasNext: function() {
    return this.state.hasNextPage || this.getStore(EndUserStore).getTotalDisplayUsers() < this.getStore(EndUserStore).getTotalUsers();
  },

  render: function() {
    let { role, identity } = this.context.router.getCurrentParams();

    return (
      <div className="row">
        <FilterBar.Wrapper>
          <FilterBar.NavigationItems>
            <Link to="end-users-overview" params={{ role, identity }}>Overview</Link>
            <Link to="end-users-details" params={{ role, identity }}>Details Report</Link>
          </FilterBar.NavigationItems>

          <FilterBar.LeftItems>
            <DateRangePicker
              withIcon
              startDate={this.state.startDate}
              endDate={this.state.endDate}
              handleStartDateChange={this.handleStartDateChange}
              handleEndDateChange={this.handleEndDateChange}
            />

            {/*
            <div>
              <select className="status-select top-bar-section__query-input" name="statusSelect" onChange={this.handleStatusChange}>
                <option key={'status'} value="">Choose Account Status</option>
                {accountStatus.map((status)=>{
                  return <option key={status} value={status.toUpperCase()}>{status}</option>;
                })}
              </select>
            </div>
          */}

          </FilterBar.LeftItems>
          <FilterBar.RightItems>
            <li className="top-bar--inner">
              <Export exportType="End_User">
                <EndUserExportForm
                  carrierId={this.context.router.getCurrentParams().identity}
                  startDate={this.state.startDate}
                  endDate={this.state.endDate}
                />
              </Export>
            </li>

          </FilterBar.RightItems>
        </FilterBar.Wrapper>
        <div className="large-24 columns">
          <div className="large-16 columns">
            <EndUserTable
              ref="endUserTable"
              currentUser={this.getStore(EndUserStore).getCurrentUser()}
              users={this.applyFilters(this.getStore(EndUserStore).getDisplayUsers())}
              hasNext={this._checkHasNext()}
              onUserClick={this.handleUserClick}
              onPageChange={this.handleShowNextPage}
            />
          </div>
          <div className="large-8 columns">
            <If condition={this.getStore(EndUserStore).getCurrentUser()}>
              <EndUserProfile user={this.getStore(EndUserStore).getCurrentUser()} />
            </If>
          </div>
        </div>
      </div>
    );
  }
});

export default EndUsers;
