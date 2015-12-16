import _ from 'lodash';
import moment from 'moment';
import {concurrent} from 'contra';

import React from 'react';
import { Link } from 'react-router';
import AuthMixin from '../../../utils/AuthMixin';
import FluxibleMixin from 'fluxible/addons/FluxibleMixin';

import loadTransactions from '../actions/loadTransactions';
import clearTopUp from '../actions/clearTopUp';

import TopUpTable from './TopUpTable';
import TopUpStore from '../stores/TopUpStore';

import * as FilterBar from './../../../main/components/FilterBar';
import DateRangePicker from './../../../main/components/DateRangePicker';
import DatePicker from './../../../main/components/DatePicker';
import SearchBox from './../../../main/components/Searchbox';
import Tooltip from './../../../main/components/Tooltip';

let { inputDateFormat: DATE_FORMAT } = require('./../../../main/config');
let { pages: { topUp: { pageRec: PAGE_REC } } } = require('./../../../main/config');

// See: https://issuetracking.maaii.com:9443/display/HKBoss/Maaii+Payment#MaaiiPayment-GetTransactionHistory
// page = 0 shows only total records
// page = 1 1st page
const INITIAL_PAGE_NUMBER = 1;

// WLP-323
const MAX_QUERY_DATE_RANGE = 7;

const ONLY_NUMBER_MESSAGE = 'Only numbers are allowed.';

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
      let defaultQuery = {
        carrierId: null,
        startDate: moment().startOf('day').subtract(MAX_QUERY_DATE_RANGE, 'days').format(DATE_FORMAT),
        endDate: moment().endOf('day').format(DATE_FORMAT),
        number: null,
        page: INITIAL_PAGE_NUMBER,
        pageRec: PAGE_REC
      };

      concurrent([
        context.executeAction.bind(context, clearTopUp, {}),
        context.executeAction.bind(context, loadTransactions, _.merge(_.clone(defaultQuery), getInitialQueryFromURL(params, query), { reload: true }))
      ], done || function() {});
    }
  },

  getInitialState: function() {
    return _.merge(_.clone(this.getDefaultQuery()), this.getRequestBodyFromQuery(), this.getStateFromStores());
  },

  getDefaultQuery() {
    return {
      carrierId: null,
      startDate: moment().startOf('day').subtract(MAX_QUERY_DATE_RANGE, 'days').format(DATE_FORMAT),
      endDate: moment().endOf('day').format(DATE_FORMAT),
      number: null,
      page: INITIAL_PAGE_NUMBER,
      pageRec: PAGE_REC
    };
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

    let updates = {
      startDate: date
    };

    if (moment(this.state.endDate, 'L').diff(momentDate, 'days') > MAX_QUERY_DATE_RANGE) {
      updates.endDate = moment(momentDate).add(MAX_QUERY_DATE_RANGE,'days').format(DATE_FORMAT);
    }

    this.setState(updates);

    updates.page = INITIAL_PAGE_NUMBER;

    this.handleQueryChange(updates);
  },

  handleEndDateChange: function(momentDate) {
    let date = moment(momentDate).format(DATE_FORMAT);

    let updates = {
      endDate: date
    };

    if (moment(momentDate).diff(moment(this.state.startDate,'L'), 'days') > MAX_QUERY_DATE_RANGE) {
      updates.startDate = moment(momentDate).subtract(MAX_QUERY_DATE_RANGE,'days').format(DATE_FORMAT);
    }

    this.setState(updates);

    updates.page = INITIAL_PAGE_NUMBER;
    this.handleQueryChange(updates);
  },

  handleSearchInputChange: function(e) {
    if (!this.validateSearchInput(e.target.value)) {
      this.showTooltip();
      return;
    } else {
      this.hideTooltip();
    }
    this.setState({ number: e.target.value });
  },

  handleSearchInputSubmit: function(e) {
    if ( e.which == 13 && this.validateSearchInput(e.target.value) ) {
      this.handleQueryChange({ number: e.target.value, page: INITIAL_PAGE_NUMBER });
    }
  },

  validateSearchInput(number) {
    if (!number) {
      return true;
    }
    let regex = /^\d+$/;
    return regex.test(number);
  },

  showTooltip: function() {
    this.setState({tooltipShow: true});
  },

  hideTooltip: function() {
    this.setState({tooltipShow: false});
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
            <Tooltip
              showTooltip={this.state.tooltipShow}
              mouseActive={false}
              cssName="top-up"
              tip={ONLY_NUMBER_MESSAGE}
              placement='left'>
              <SearchBox
                value={this.state.number}
                placeHolder="Mobile"
                onInputChangeHandler={this.handleSearchInputChange}
                onKeyPressHandler={this.handleSearchInputSubmit}
              />
            </Tooltip>
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
