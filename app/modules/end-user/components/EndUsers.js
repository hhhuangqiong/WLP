import _ from 'lodash';
import moment from 'moment';
import {concurrent} from 'contra';

import React from 'react';
import FluxibleMixin from 'fluxible/addons/FluxibleMixin';

import AuthMixin from '../../../utils/AuthMixin';

import EndUserStore from '../stores/EndUserStore';

import fetchEndUser from '../actions/fetchEndUser';
import fetchEndUsers from '../actions/fetchEndUsers';
import clearEndUsers from '../actions/clearEndUsers';
import showNextPage from '../actions/showNextPage';

import * as FilterBar from './../../../main/components/FilterBar';
import DateRangePicker from './../../../main/components/DateRangePicker';
import DatePicker from './../../../main/components/DatePicker';
import SearchBox from './../../../main/components/Searchbox';

import EndUserTable from './EndUserTable';
import EndUserProfile from './EndUserProfile';

import config from './../../../main/config';

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
        context.executeAction.bind(context, clearEndUsers),
        context.executeAction.bind(context, fetchEndUsers, _.merge(_.clone(defaultQuery), getInitialQueryFromURL(params, query)))
      ], done || function() {});
    }
  },

  getInitialState: function() {
    return _.merge(_.clone(defaultQuery), this.getRequestBodyFromQuery(), this.getStateFromStores());
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
    }
  },

  onChange: function() {
    this.setState(this.getStateFromStores());
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
          </FilterBar.LeftItems>
        </FilterBar.Wrapper>
        <div className="large-24 columns">
          <div className="large-16 columns">
            <EndUserTable
              ref="endUserTable"
              users={this.getStore(EndUserStore).getDisplayUsers()}
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
