import _, { omit, merge } from 'lodash';
import moment from 'moment';
import { concurrent } from 'contra';

import classNames from 'classnames';
import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import { FormattedMessage } from 'react-intl';

import { FluxibleMixin } from 'fluxible-addons-react';

import * as FilterBar from '../../../main/components/FilterBar';
import DatePicker from '../../../main/components/DatePicker';

import fetchCalls from '../actions/fetchCalls';
import fetchMoreCalls from '../actions/fetchMoreCalls';
import clearCallsReport from '../actions/clearCallsReport';

import CallsTable from './CallsTable';
import CallsStore from '../stores/CallsStore';
import Searchbox from '../../../main/components/Searchbox';

import Export from '../../../main/file-export/components/Export';
import CallsExportForm from './CallsExportForm';

import config from '../../../config';
import CALL_TYPE from '../constants/callType';

const Calls = React.createClass({
  contextTypes: {
    executeAction: PropTypes.func.isRequired,
    location: PropTypes.object,
    params: PropTypes.object,
    route: PropTypes.object,
    router: PropTypes.func,
  },

  mixins: [FluxibleMixin],

  statics: {
    storeListeners: [CallsStore],

    fetchData(context, params, query, done) {
      concurrent([
        context.executeAction.bind(context, clearCallsReport),
        context.executeAction.bind(context, fetchCalls, {
          carrierId: params.identity,
          startDate: query.startDate || moment().subtract(2, 'day').startOf('day').format('L'),
          endDate: query.endDate || moment().endOf('day').format('L'),
          size: config.PAGES.CALLS.PAGE_SIZE,
          // The page number, starting from 0, defaults to 0 if not specified.
          page: query.page || 0,
          type: query.type || CALL_TYPE.ALL,
          search: query.search || '',
          searchType: query.searchType || 'caller',
        }),
      ], done || function () {});
    },
  },

  getStateFromStores() {
    const store = this.getStore(CallsStore);

    return {
      calls: store.getCalls(),
      callsCount: store.getCallsCount(),
      page: store.getPageNumber(),
      totalPages: store.getTotalPages(),
      isLoadingMore: store.isLoadingMore,
    };
  },

  getDefaultQuery() {
    return {
      // The page number, starting from 0, defaults to 0 if not specified.
      page: 0,
      size: config.PAGES.CALLS.PAGE_SIZE,
      startDate: moment().subtract(2, 'day').startOf('day').format('L'),
      endDate: moment().endOf('day').format('L'),
      type: CALL_TYPE.ALL,
      search: '',
      searchType: 'caller',
    };
  },

  getInitialState() {
    const query = _.merge(this.getDefaultQuery(), this.context.location.query);
    const queryAndStore = _.merge(this.getStateFromStores(), query);
    return queryAndStore;
  },

  componentDidMount() {
    $(document).foundation('reveal', 'reflow');
  },

  componentWillUnmount() {
    this.context.executeAction(clearCallsReport);
  },

  onChange() {
    const query = _.merge(this.getDefaultQuery(), this.context.location.query);
    this.setState(_.merge(query, this.getStateFromStores()));
  },

  getQueryFromState() {
    return {
      startDate: this.state.startDate && this.state.startDate.trim(),
      endDate: this.state.endDate && this.state.endDate.trim(),
      search: this.state.search && this.state.search.trim(),
      page: 0,
      size: config.PAGES.CALLS.PAGE_SIZE,
      type: this.state.type && this.state.type.trim(),
      searchType: this.state.searchType && this.state.searchType.trim(),
    };
  },

  handleQueryChange(newQuery) {
    const query = merge(
      this.context.location.query,
      this.getQueryFromState(),
      newQuery
    );

    const queryWithoutNull = omit(query, value => !value);

    const { pathname } = this.context.location;

    this.context.router.push({
      pathname,
      query: queryWithoutNull,
    });
  },

  handlePageChange() {
    const { identity } = this.context.params;

    this.context.executeAction(fetchMoreCalls, {
      carrierId: identity,
      startDate: this.state.startDate,
      endDate: this.state.endDate,
      page: +this.state.page + 1,
      size: config.PAGES.CALLS.PAGE_SIZE,
      type: this.state.type,
      search: this.state.search,
      searchType: this.state.searchType,
    });
  },

  handleStartDateChange(momentDate) {
    const date = moment(momentDate).format('L');
    this.handleQueryChange({ startDate: date, page: 0 });
  },

  handleEndDateChange(momentDate) {
    const date = moment(momentDate).format('L');
    this.handleQueryChange({ endDate: date, page: 0 });
  },

  handleAllTypeClick() {
    this.handleQueryChange({ type: CALL_TYPE.ALL });
  },

  handleOnnetClick(e) {
    e.preventDefault();
    this.handleQueryChange({ type: CALL_TYPE.ONNET });
  },

  handleOffnetClick(e) {
    e.preventDefault();
    this.handleQueryChange({ type: CALL_TYPE.OFFNET });
  },

  handleMaaiiInClick(e) {
    e.preventDefault();

    let type = null;

    if (this.state.type !== CALL_TYPE.MAAII_IN) {
      type = CALL_TYPE.MAAII_IN;
    }

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

  handleSearchTypeChange(e) {
    const searchType = e.target.value;
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

  render() {
    const { role, identity } = this.context.params;
    const searchTypes = [{ name: 'Caller', value: 'caller' }, { name: 'Callee', value: 'callee' }];

    return (
      <div className="row">
        <FilterBar.Wrapper>
          <FilterBar.NavigationItems>
            <Link to={`/${role}/${identity}/calls/overview`} activeClassName="active">
			  <FormattedMessage id="overview" defaultMessage="Overview" />
			</Link>
            <Link to={`/${role}/${identity}/calls/details`} activeClassName="active">
			  <FormattedMessage id="detailsReport" defaultMessage="Details Report" />
			</Link>
          </FilterBar.NavigationItems>
          <FilterBar.LeftItems>
            <a
              className={classNames({ active: this.state.type === CALL_TYPE.ALL })}
              onClick={this.handleAllTypeClick}
            >
              <FormattedMessage id="all" defaultMessage="All" />
            </a>
            <a
              className={classNames({ active: this.state.type === CALL_TYPE.ONNET })}
              onClick={this.handleOnnetClick}
            >
              <FormattedMessage id="onnet" defaultMessage="Onnet" />
            </a>
            <a
              className={classNames({ active: this.state.type === CALL_TYPE.OFFNET })}
              onClick={this.handleOffnetClick}
            >
              <FormattedMessage id="offnet" defaultMessage="Offnet" />
            </a>
            <a
              className={classNames({ active: this.state.type === CALL_TYPE.MAAII_IN })}
              onClick={this.handleMaaiiInClick}
            >
              <FormattedMessage id="maaiiIn" defaultMessage="Maaii-In" />
            </a>
          </FilterBar.LeftItems>
          <FilterBar.RightItems>
            {/* TODO: Move filter control items into DropdownFilter according to new design */}
            {/* <DropdownFilter /> */}

            <div className="date-range-picker left">
              <i className="date-range-picker__icon icon-calendar left" />
              <div className="date-input-wrap date-range-picker__start left" onClick={this._handleStartDateClick}>
                <span className="interactive-button left date-range-picker__date-span">{this.state.startDate}</span>
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
              <div className="date-input-wrap date-range-picker__end left" onClick={this._handleEndDateClick}>
                <span className="interactive-button left date-range-picker__date-span">{this.state.endDate}</span>
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
              selectedType={this.state.searchType}
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
            isLoadingMore={this.state.isLoadingMore}
          />
        </div>
      </div>
    );
  },
});

export default Calls;
