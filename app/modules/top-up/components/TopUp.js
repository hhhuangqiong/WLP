import _ from 'lodash';
import moment from 'moment';
import {concurrent} from 'contra';

import React from 'react';
import { Link } from 'react-router';
import AuthMixin from '../../../utils/AuthMixin';
import FluxibleMixin from 'fluxible/addons/FluxibleMixin';

import loadTransactions from '../actions/loadTransactions';

import TopUpTable from './TopUpTable';
import TopUpStore from '../stores/TopUpStore';

import * as FilterBar from './../../../main/components/FilterBar';
import DateRangePicker from './../../../main/components/DateRangePicker';
import DatePicker from './../../../main/components/DatePicker';
import SearchBox from './../../../main/components/Searchbox';

let { displayDateFormat: DATE_FORMAT } = require('./../../../main/config');
let { pages: { topUp: { pageRec: PAGE_REC } } } = require('./../../../main/config');

// See: https://issuetracking.maaii.com:9443/display/HKBoss/Maaii+Payment#MaaiiPayment-GetTransactionHistory
// page = 0 shows only total records
// page = 1 1st page
const INITIAL_PAGE_NUMBER = 1;

const defaultQuery = {
  carrierId: null,
  startDate: moment().startOf('day').subtract(30, 'day').format(DATE_FORMAT),
  endDate: moment().endOf('day').format(DATE_FORMAT),
  number: null,
  page: INITIAL_PAGE_NUMBER,
  pageRec: PAGE_REC
};

function getInitialQueryFromURL(params, query = {}) {
  return {
    carrierId: params.identity,
    startDate: query.startDate,
    endDate: query.endDate,
    number: query.number,
    page: query.page,
    pageRec: query.pageRec
  };
}

var TopUp = React.createClass({
  contextTypes: {
    router: React.PropTypes.func.isRequired
  },

  mixins: [FluxibleMixin, AuthMixin],

  statics: {
    storeListeners: [TopUpStore],

    fetchData: function(context, params, query, done) {
      concurrent([
        context.executeAction.bind(context, loadTransactions, _.merge(_.clone(defaultQuery), getInitialQueryFromURL(params, query), { reload: true }))
      ], done || function() {});
    }
  },

  getInitialState: function() {
    return _.merge(_.clone(defaultQuery), this.getRequestBodyFromQuery(), this.getStateFromStores());
  },

  getRequestBodyFromQuery: function(query) {
    let { startDate, endDate, number, page, pageRec } = query || this.context.router.getCurrentQuery();
    return { startDate, endDate, number, page, pageRec };
  },

  getRequestBodyFromState: function() {
    let { identity } = this.context.router.getCurrentParams();
    let { startDate, endDate, number, page, pageRec } = this.state;
    return { carrierId: identity, startDate, endDate, number, page, pageRec };
  },

  getStateFromStores: function() {
    return {
      totalRec: this.getStore(TopUpStore).getTotalRec(),
      page: this.getStore(TopUpStore).getPage()
    }
  },

  onChange: function() {
    this.setState(this.getStateFromStores());
  },

  handleQueryChange: function(newQuery) {
    let routeName = _.last(this.context.router.getCurrentRoutes()).name;
    let params = this.context.router.getCurrentParams();
    let query = _.merge(this.getRequestBodyFromQuery(), this.getRequestBodyFromState(), newQuery);

    this.context.router.transitionTo(routeName, params, _.omit(query, function(value) {
      return !value;
    }));
  },

  // action for client side
  // so properties in state will domainate
  handlePageLoad: function() {
    let targetPage = +this.state.page + 1
    this.setState({ page: targetPage });

    this.context.executeAction(loadTransactions, _.merge(this.getRequestBodyFromState(), { page: targetPage }));
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

  handleSearchInputChange: function(e) {
    this.setState({
      number: e.target.value
    });

    if (e.which == 13) {
      this.handleQueryChange({ number: e.target.value, page: INITIAL_PAGE_NUMBER });
    }
  },

  render: function() {
    let params = this.context.router.getCurrentParams();

    return (
      <div className="row">
        <FilterBar.Wrapper>
          <FilterBar.NavigationItems>
            <Link to="top-up-details" params={params}>Details Report</Link>
          </FilterBar.NavigationItems>
          <FilterBar.LeftItems>
            <DateRangePicker
              withIcon={true}
              startDate={this.state.startDate}
              endDate={this.state.endDate}
              handleStartDateChange={this.handleStartDateChange}
              handleEndDateChange={this.handleEndDateChange}
            />
          </FilterBar.LeftItems>
          <FilterBar.RightItems>
            <SearchBox
              placeHolder="Username/Mobile"
              onKeyPressHandler={this.handleSearchInputChange}
            />
          </FilterBar.RightItems>
        </FilterBar.Wrapper>
        <div className="large-24 columns">
          <TopUpTable
            totalRec={this.state.totalRec}
            histories={this.getStore(TopUpStore).getHistories()}
            page={this.state.page}
            pageRec={this.state.pageRec}
            onPageLoad={this.handlePageLoad}
          />
        </div>
      </div>
    );
  }
});

export default TopUp;
