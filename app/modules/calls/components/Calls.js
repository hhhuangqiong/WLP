import _ from 'lodash';
import moment from 'moment';
import { concurrent } from 'contra';
import classNames from 'classnames';
import React from 'react';
import FluxibleMixin from 'fluxible/addons/FluxibleMixin';
import { Link } from 'react-router';

import * as FilterBar from '../../../main/components/FilterBar';
import DatePicker from '../../../main/components/DatePicker';

import AuthMixin from '../../../utils/AuthMixin';
import fetchCalls from '../actions/fetchCalls';
import fetchMoreCalls from '../actions/fetchMoreCalls';

import CallsTable from './CallsTable';
import CallsStore from '../stores/CallsStore';
import Searchbox from '../../../main/components/Searchbox';

import Export from '../../../main/file-export/components/Export';
import CallsExportForm from './CallsExportForm';

import config from '../../../config';

const CALL_TYPE = {
  ALL: '',
  ONNET: 'ONNET',
  OFFNET: 'OFFNET',
};

const Calls = React.createClass({
  contextTypes: {
    router: React.PropTypes.func.isRequired,
    executeAction: React.PropTypes.func.isRequired,
  },

  mixins: [FluxibleMixin, AuthMixin],

  statics: {
    storeListeners: [CallsStore],

    fetchData: function(context, params, query, done) {
      concurrent([
        context.executeAction.bind(context, fetchCalls, {
          carrierId: params.identity,
          startDate: query.startDate || moment().subtract(2, 'day').startOf('day').format('L'),
          endDate: query.endDate || moment().endOf('day').format('L'),
          size: config.PAGES.CALLS.PAGE_SIZE,
          // The page number, starting from 0, defaults to 0 if not specified.
          page: query.page || 0,
          type: query.type || CALL_TYPE.ALL,
          search: query.search || '',
          searchType: query.searchType || 'caller'
        })
      ], done || function() {});
    }
  },

getStateFromStores: function() {
    let store = this.getStore(CallsStore);

    return {
      calls: store.getCalls(),
      callsCount: store.getCallsCount(),
      page: store.getPageNumber(),
      totalPages: store.getTotalPages()
    };
  },

  getDefaultQuery: function() {
    return {
      // The page number, starting from 0, defaults to 0 if not specified.
      page: 0,
      size: config.PAGES.CALLS.PAGE_SIZE,
      startDate: moment().subtract(2, 'day').startOf('day').format('L'),
      endDate: moment().endOf('day').format('L'),
      type: CALL_TYPE.ALL,
      search: '',
      searchType: 'caller'
    };
  },

  getInitialState: function () {
    let query = _.merge(this.getDefaultQuery(), this.context.router.getCurrentQuery());
    let queryAndStore = _.merge(this.getStateFromStores(), query);
    return queryAndStore;
  },

  onChange: function() {
    let query = _.merge(this.getDefaultQuery(), this.context.router.getCurrentQuery());
    this.setState(_.merge(query, this.getStateFromStores()));
  },

  getQueryFromState: function() {
    return {
      startDate: this.state.startDate && this.state.startDate.trim(),
      endDate: this.state.endDate && this.state.endDate.trim(),
      search: this.state.search && this.state.search.trim(),
      page: 0,
      size: config.PAGES.CALLS.PAGE_SIZE,
      type: this.state.type && this.state.type.trim(),
      searchType: this.state.searchType && this.state.searchType.trim()
    }
  },

  handleQueryChange: function(newQuery) {
    let routeName = _.last(this.context.router.getCurrentRoutes()).name;
    let params = this.context.router.getCurrentParams();
    let query = _.merge(this.context.router.getCurrentQuery(), this.getQueryFromState(), newQuery);

    this.context.router.transitionTo(routeName, params, _.omit(query, function(value) {
      return !value;
    }));
  },

  handlePageChange: function(e) {
    let { identity } = this.context.router.getCurrentParams();

    this.context.executeAction(fetchMoreCalls, {
      carrierId: identity,
      startDate: this.state.startDate,
      endDate: this.state.endDate,
      page: +this.state.page + 1,
      size: config.PAGES.CALLS.PAGE_SIZE,
      type: this.state.type,
      search: this.state.search,
      searchType: this.state.searchType
    });
  },

  handleStartDateChange: function(momentDate) {
    let date = moment(momentDate).format('L');
    this.handleQueryChange({ startDate: date, page: 0 });
  },

  handleEndDateChange: function(momentDate) {
    let date = moment(momentDate).format('L');
    this.handleQueryChange({ endDate: date, page: 0 });
  },

  handleAllTypeClick() {
    const type = null;
    this.handleQueryChange({ type });
  },

  handleOnnetClick() {
    let type = null;
    if (this.state.type !== CALL_TYPE.ONNET) type = CALL_TYPE.ONNET;
    this.handleQueryChange({ type });
  },

  handleOffnetClick() {
    let type = null;
    if (this.state.type !== CALL_TYPE.OFFNET) type = CALL_TYPE.OFFNET;
    this.handleQueryChange({ type });
  },

  handleUsernameChange(e) {
    this.setState({ search: e.target.value });
  },

  handleSearchSubmit(e) {
    if (e.which === 13) {
      e.preventDefault();
      this.handleQueryChange();
    }
  },

  handleSearchTypeChange: function(e) {
    let searchType = e.target.value;
    this.setState({ searchType });

    // only submit change if search input isn't empty
    if (this.state.search) {
      this.handleQueryChange({ searchType });
    }
  },

  _handleStartDateClick() {
    this.refs.startDatePicker._handleFocus();
  },

  _handleEndDateClick() {
    this.refs.endDatePicker._handleFocus();
  },

  componentDidMount() {
    $(document).foundation('reveal', 'reflow');
  },

  render() {
    const params = this.context.router.getCurrentParams();
    const searchTypes = [{name: 'Caller', value: 'caller'}, {name: 'Callee', value: 'callee'}];

    /* Temporarily disabled overview section for Calls
    TODO: put it back into tab-bar
     <li className="top-bar--inner tab--inverted__title">
     <Link to="calls-overview" params={params}>Overview</Link>
     </li>
     */

    return (
      <div className="row">
        <FilterBar.Wrapper>
          <FilterBar.NavigationItems>
            <Link to="calls-overview" params={params}>Overview</Link>
            <Link to="calls-details" params={params}>Details Report</Link>
          </FilterBar.NavigationItems>
          <FilterBar.LeftItems>
            <a className={classNames({ active: this.state.type === CALL_TYPE.ALL })} onClick={this.handleAllTypeClick}>All</a>
            <a className={classNames({ active: this.state.type === CALL_TYPE.ONNET })} onClick={this.handleOnnetClick}>On-net</a>
            <a className={classNames({ active: this.state.type === CALL_TYPE.OFFNET })} onClick={this.handleOffnetClick}>Off-net</a>
          </FilterBar.LeftItems>
          <FilterBar.RightItems>
            {/*<DropdownFilter />*/}

            <div className="date-range-picker left">
              <i className="date-range-picker__icon icon-calendar left" />
              <div className="date-input-wrap left" onClick={this._handleStartDateClick}>
                <span className="clickable-button left date-range-picker__date-span">{this.state.startDate}</span>
                <DatePicker
                  ref="startDatePicker"
                  key="start-date"
                  dateFormat="MM/DD/YYYY"
                  selected={moment(this.state.startDate, 'L')}
                  maxDate={moment(this.state.endDate, 'L')}
                  onChange={this.handleStartDateChange}
                />
              </div>
              <i className="date-range-picker__separator left">-</i>
              <div className="date-input-wrap left" onClick={this._handleEndDateClick}>
                <span className="clickable-button left date-range-picker__date-span">{this.state.endDate}</span>
                <DatePicker
                  ref="endDatePicker"
                  key="end-date"
                  dateFormat="MM/DD/YYYY"
                  selected={moment(this.state.endDate, 'L')}
                  minDate={moment(this.state.startDate, 'L')}
                  maxDate={moment()}
                  onChange={this.handleEndDateChange}
                />
              </div>
            </div>

            <Export exportType="Calls">
              <CallsExportForm
                startDate={this.state.startDate}
                endDate={this.state.endDate}
                netType={this.state.type}
                />
            </Export>

            <Searchbox
              value={this.state.search}
              searchTypes={searchTypes}
              placeHolder="Username/Mobile"
              onInputChangeHandler={this.handleUsernameChange}
              onSelectChangeHandler={this.handleSearchTypeChange}
              onKeyPressHandler={this.handleSearchSubmit}
            />
          </FilterBar.RightItems>
        </FilterBar.Wrapper>

        <div className="large-24 columns">
          <CallsTable
            totalRec={this.state.callsCount}
            calls={this.state.calls}
            page={this.state.page}
            pageRec={this.state.size}
            totalPages={this.state.totalPages}
            onDataLoad={this.handlePageChange}
          />
        </div>
      </div>
    );
  },
});

export default Calls;
