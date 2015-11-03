import _ from 'lodash';
import moment from 'moment';
import {concurrent} from 'contra';

import React from 'react';
import FluxibleMixin from 'fluxible/addons/FluxibleMixin';

import AuthMixin from '../../../utils/AuthMixin';

import EndUserStore from '../stores/EndUserStore';

import fetchEndUser from '../actions/fetchEndUser';
import fetchEndUsers from '../actions/fetchEndUsers';
import fetchEndUserAsEndUsers from '../actions/fetchEndUserAsEndUsers';
import clearEndUsers from '../actions/clearEndUsers';
import showNextPage from '../actions/showNextPage';

import * as FilterBar from './../../../main/components/FilterBar';
import DateRangePicker from './../../../main/components/DateRangePicker';
import DatePicker from './../../../main/components/DatePicker';
import SearchBox from './../../../main/components/Searchbox';
import Export from './../../../main/file-export/components/Export';

import EndUserTable from './EndUserTable';
import EndUserProfile from './EndUserProfile';
import EndUserExportForm from './EndUserExportForm';

import config from './../../../main/config';
import { accountStatus } from '../../../main/constants/accountStatus';

let { inputDateFormat: DATE_FORMAT } = config;
let { pages: { endUser: { pageRec: PAGE_REC } } } = config;

// See: https://issuetracking.maaii.com:9443/display/MAAIIP/MUMS+User+Management+by+Carrier+HTTP+API
// page = 0 1st page
const INITIAL_PAGE_NUMBER = 0;
const MONTHS_BEFORE_TODAY = 1;

const defaultQuery = {
  carrierId: null,
  startDate: moment().startOf('day').subtract(MONTHS_BEFORE_TODAY, 'month').format(DATE_FORMAT),
  endDate: moment().endOf('day').format(DATE_FORMAT),
  page: INITIAL_PAGE_NUMBER
};

function getInitialQueryFromURL(params, query = {}) {
  return {
    carrierId: params.identity,
    startDate: query.startDate,
    endDate: query.endDate,
    bundleId: query.bundleId,
    status: query.status,
    username: query.search,
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
    return _.merge(_.clone(defaultQuery), this.getRequestBodyFromQuery(), this.getStateFromStores());
  },

  componentDidMount: function() {
    this.executeAction(fetchEndUsers, _.merge(_.clone(defaultQuery), this.getRequestBodyFromState(), this.getStateFromStores()));
  },

  loadFirstUserDetail: function() {
    let users = this.getStore(EndUserStore).getDisplayUsers();
    let currentUser = this.getStore(EndUserStore).getCurrentUser();
    if (!_.isEmpty(users) && _.isEmpty(currentUser)) {
      let {username} = users[0];
      this.handleUserClick(username);
    }
  },

  getRequestBodyFromQuery: function(query) {
    let { startDate, endDate, search, page } = query || this.context.router.getCurrentQuery();
    return { startDate, endDate, search, page };
  },

  getRequestBodyFromState: function() {
    let { identity } = this.context.router.getCurrentParams();
    let { startDate, endDate, search, page } = this.state;
    return { carrierId: identity, startDate, endDate, search, page };
  },

  getStateFromStores: function() {
    return {
      page: this.getStore(EndUserStore).getPage(),
      hasNextPage: this.getStore(EndUserStore).getHasNextPage(),
      currentUser: this.context.router.getCurrentParams.username ? this.getStore(EndUserStore).getCurrentUser() : null
    }
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

  handleSearchChange: function(e) {
    this.setState({
      search: e.target.value
    });
  },

  handleSearchSubmit: function(e) {
    // on enter pressed
    if (e.which == 13) {
      e.preventDefault();
      this.setState({ bundleId: '', status: '' });
      this.handleQueryChange({ bundleId: '', status: '' });
    }
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
    return (
      <div className="row">
        <FilterBar.Wrapper>
          <FilterBar.LeftItems>
            <DateRangePicker
              withIcon={true}
              startDate={this.state.startDate}
              endDate={this.state.endDate}
              handleStartDateChange={this.handleStartDateChange}
              handleEndDateChange={this.handleEndDateChange}
              />

            <div>
              <select className="bundle-select top-bar-section__query-input" name="bundleIdSelect" onChange={this.handleBundleIdChange}>
                <option key={'bundleId'} value="">Choose Bundle ID</option>
                {this.getStore(EndUserStore).getBundleIds().map((bundleId)=>{
                  if (bundleId) {
                    return <option key={bundleId} value={bundleId}>{bundleId}</option>;
                  }
                })}
              </select>
            </div>

            <div>
              <select className="status-select top-bar-section__query-input" name="statusSelect" onChange={this.handleStatusChange}>
                <option key={'status'} value="">Choose Account Status</option>
                {accountStatus.map((status)=>{
                  return <option key={status} value={status.toUpperCase()}>{status}</option>;
                })}
              </select>
            </div>

          </FilterBar.LeftItems>
          <FilterBar.RightItems>
            <SearchBox
                placeHolder="Mobile number"
                onInputChangeHandler={this.handleSearchChange}
                onKeyPressHandler={this.handleSearchSubmit}
              />

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
