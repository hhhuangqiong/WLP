import _ from 'lodash';
import moment from 'moment';
import {concurrent} from 'contra';

import React from 'react';
import { Link } from 'react-router';
import AuthMixin from '../../../utils/AuthMixin';
import FluxibleMixin from 'fluxible/addons/FluxibleMixin';

import loadSMS from '../actions/loadSMS';
import clearSMS from '../actions/clearSMS';

import SMSTable from './SMSTable';
import SMSStore from '../stores/SMSStore';

import * as FilterBar from './../../../main/components/FilterBar';
import DateRangePicker from './../../../main/components/DateRangePicker';
import DatePicker from './../../../main/components/DatePicker';
import SearchBox from './../../../main/components/Searchbox';

import config from './../../../main/config';

let { inputDateFormat: DATE_FORMAT } = config
let { pages: { topUp: { pageRec: PAGE_REC } } } = config;

// See: https://issuetracking.maaii.com:9443/display/MAAIIP/SMS+Search+API
// page = 0 1st page
const INITIAL_PAGE_NUMBER = 0;
const MONTHS_BEFORE_TODAY = 1;

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

var SMS = React.createClass({
  contextTypes: {
    router: React.PropTypes.func.isRequired
  },

  mixins: [FluxibleMixin, AuthMixin],

  statics: {
    storeListeners: [SMSStore],

    fetchData: function(context, params, query, done) {
      let defaultQuery = {
        carrierId: null,
        startDate: moment().startOf('day').subtract(MONTHS_BEFORE_TODAY, 'month').format(DATE_FORMAT),
        endDate: moment().endOf('day').format(DATE_FORMAT),
        number: null,
        page: INITIAL_PAGE_NUMBER,
        pageRec: PAGE_REC
      };

      concurrent([
        context.executeAction.bind(context, clearSMS, {}),
        context.executeAction.bind(context, loadSMS, _.merge(_.clone(defaultQuery), getInitialQueryFromURL(params, query)))
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
      page: this.getStore(SMSStore).getPage(),
      totalPage: this.getStore(SMSStore).getTotalPage()
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
    let targetPage = +this.state.page + 1;
    this.setState({ page: targetPage });

    this.context.executeAction(loadSMS, _.merge(this.getRequestBodyFromState(), { page: targetPage }));
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
  },

  handleSearchInputSubmit: function(e) {
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
            <Link to="sms-overview" params={params}>Overview</Link>
            <Link to="sms-details" params={params}>Details Report</Link>
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
              value={this.state.number}
              onInputChangeHandler={this.handleSearchInputChange}
              onKeyPressHandler={this.handleSearchInputSubmit}
            />
          </FilterBar.RightItems>
        </FilterBar.Wrapper>
        <div className="large-24 columns">
          <SMSTable
            totalPage={this.state.totalPage}
            records={this.getStore(SMSStore).getSMS()}
            page={this.state.page}
            onPageLoad={this.handlePageLoad}
          />
        </div>
      </div>
    );
  }
});

export default SMS;
