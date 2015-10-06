import _ from 'lodash';
import moment from 'moment';
import classNames from 'classnames';

import React from 'react';
import FluxibleMixin from 'fluxible/addons/FluxibleMixin';
import {Link} from 'react-router';

import DatePicker from 'react-datepicker';
import Select from 'react-select';

import AuthMixin from '../../../utils/AuthMixin';

import * as FilterBar from './../../../main/components/FilterBar';
import DateRangePicker from './../../../main/components/DateRangePicker';
import SearchBox from './../../../main/components/Searchbox';

import fetchVerifications from '../actions/fetchVerifications';
import fetchMoreVerifications from '../actions/fetchMoreVerifications';

import VerificationStore from '../stores/VerificationStore';
import ApplicationStore from '../../../stores/ApplicationStore';

import VerificationTable from './VerificationTable';
import config from '../../../config';

const debug = require('debug')('app:verification/components/Verification');
const ENTER_KEY = 13;

let { inputDateFormat: DATE_FORMAT } = require('./../../../main/config');

let VerificationDetails = React.createClass({
  contextTypes: {
    router: React.PropTypes.func.isRequired,
    executeAction: React.PropTypes.func.isRequired
  },

  mixins: [FluxibleMixin, AuthMixin],

  statics: {
    storeListeners: {
      onChange: VerificationStore,
      onApplicationStoreChange: ApplicationStore
    },

    fetchData: function (context, params, query, done) {
      // when no appId was provided, don't have to pre-render
      if (!query.appId) {
        done();
        return;
      }

      context.executeAction(fetchVerifications, {
        carrierId: params.identity,
        appId: query.appId,
        startDate: query.startDate || moment().subtract(2, 'month').startOf('day').format(DATE_FORMAT),
        endDate: query.endDate || moment().endOf('day').format(DATE_FORMAT),
        method: query.method,
        os: query.os,
        number: query.number,
        size: config.PAGES.VERIFICATIONS.PAGE_SIZE,
        page: query.page || 0
      }, done || Function.prototype);
    }
  },

  /**
   * @typedef {Object} VerificationDetails~State
   * @property {String} appId  The application ID for the report, for remote API
   * @property {Object[]} verifications  The list of verification records
   * @property {Number} page  The current page number, starting from 0, for remote API
   * @property {Number} maxPage  The total number of pages
   * @property {Number} size  The page size, for remote API
   * @property {String} startDate  The start date the verification report in 'MM/DD/YYYY' format, for remote API
   * @property {String} endDate  The end date of the verification report in 'MM/DD/YYYY' format, for remote API
   * @property {String} number  The search query for the number number, for remote API
   * @property {String} method  The verification method, for remote API
   * @property {String} os  The OS of the end user's mobile device, for remote API
   */
  getInitialState: function () {
    let query = _.merge(this.getDefaultQuery(), this.context.router.getCurrentQuery());

    return _.merge(this.getStateFromStores(), query);
  },

  getDefaultQuery: function() {
    return {
      // The page number, starting from 0, defaults to 0 if not specified.
      page: 0,
      size: config.PAGES.VERIFICATIONS.PAGE_SIZE,
      startDate: moment().subtract(2, 'month').startOf('day').format(DATE_FORMAT),
      endDate: moment().endOf('day').format(DATE_FORMAT),
      number: '',
      method: '',
      os: ''
    };
  },

  getQueryFromState: function() {
    return {
      appId: this.state.appId,
      startDate: this.state.startDate && this.state.startDate.trim(),
      endDate: this.state.endDate && this.state.endDate.trim(),
      number: this.state.number && this.state.number.trim(),
      page: 0,
      size: config.PAGES.VERIFICATIONS.PAGE_SIZE,
      method: this.state.method && this.state.method.trim(),
      os: this.state.os && this.state.os.trim()
    }
  },

  getStateFromStores: function () {
    let store = this.getStore(VerificationStore);

    return {
      verifications: store.getVerifications(),
      page: store.getPageNumber(),
      maxPage: store.getPageCount(),
      count: store.getVerificationCount()
    };
  },

  handleQueryChange: function (newQuery) {
    let routeName = _.last(this.context.router.getCurrentRoutes()).name;
    let params = this.context.router.getCurrentParams();
    let query = _.merge(this.context.router.getCurrentQuery(), this.getQueryFromState(), newQuery);
    let changedQuery = _.omit(query, function(value) {
      return !value;
    });

    this.context.router.transitionTo(routeName, params, changedQuery);
  },

  componentDidMount: function () {
    // auto select the default appId from the list
    // TODO: optimize this UX with server side rendering

    // appId has been selected, no need to auto select
    if (this.state.appId) {
      return;
    }

    let appId = this.getStore(ApplicationStore).getDefaultAppId();

    // no default, cannot select and fetch
    // proper fetch will be done after onApplicationStoreChange
    if (!appId) {
      return;
    }

    // auto select without modifying the query string
    this.setState({
      appId
    });

    let { identity } = this.context.router.getCurrentParams();

    // fetch using the local appId because setState is async
    this.context.executeAction(fetchVerifications, {
      carrierId: identity,
      appId: appId,
      page: this.state.page,
      pageSize: this.state.pageSize,
      startDate: this.state.startDate,
      endDate: this.state.endDate,
      number: this.state.number,
      os: this.state.os,
      method: this.state.method
    });
  },

  /**
   * Selects the default application ID according to the ApplicationStore.
   * This will change the state `appId`.
   *
   * @method
   */
  autoSelectAppId: function () {
    this.onAppIdChange(this.context.getStore(ApplicationStore).getDefaultAppId());
  },

  /**
   * Fetch the verification events by advancing the page number.
   *
   * @method
   */
  fetchMore: function () {
    let { identity } = this.context.router.getCurrentParams();
    let nextPage = this.state.page + 1;

    this.setState({
      page: nextPage
    });

    this.context.executeAction(fetchMoreVerifications, {
      carrierId: identity,
      appId: this.state.appId,
      page: nextPage,
      pageSize: this.state.pageSize,
      startDate: this.state.startDate,
      endDate: this.state.endDate,
      number: this.state.number,
      os: this.state.os,
      method: this.state.method
    });
  },

  onChange: function () {
    let query = _.merge(this.getDefaultQuery(), this.context.router.getCurrentQuery());
    this.setState(_.merge(query, this.getStateFromStores()));
  },

  /**
   * Auto select the default appId when the ApplicationStore updates.
   * Selection will happen only if no appId is currently selected.
   *
   * @method
   */
  onApplicationStoreChange: function () {
    // do nothing if there is a selected appId, otherwise select the default
    if (this.state.appId) {
      return;
    }

    this.autoSelectAppId();
  },

  onAppIdChange: function (val) {
    this.setState({
      appId: val
    });

    this.handleQueryChange({
      appId: val,
      page: 0
    });
  },

  handleStartDateChange: function(dateString) {
    let date = moment(dateString).format(DATE_FORMAT);
    this.handleQueryChange({ startDate: date, page: 0 });
  },

  handleEndDateChange: function(dateString) {
    let date = moment(dateString).format(DATE_FORMAT);
    this.handleQueryChange({ endDate: date, page: 0 });
  },

  _handleStartDateClick: function() {
    this.refs.startDatePicker.handleFocus();
  },

  _handleEndDateClick: function() {
    this.refs.endDatePicker.handleFocus();
  },

  handleSearchInputChange: function (evt) {
    this.setState({
      number: evt.target.value
    });
  },

  handleSearchInputSubmit: function (evt) {
    if (evt.which === ENTER_KEY) {
      this.handleQueryChange({ number: evt.target.value, page: 0 });
    }
  },

  render: function () {
    let { role, identity } = this.context.router.getCurrentParams();

    let options = [];

    this.props.appIds.forEach(item => {
      options.push({
        value: item,
        label: item
      });
    });

    return (
      <div className="row verification-details">
        <FilterBar.Wrapper>
          <FilterBar.NavigationItems>
            <Link to="verification" params={{role, identity}}>Overview</Link>
            <Link to="verification-details" params={{role, identity}}>Details Report</Link>
          </FilterBar.NavigationItems>
          <FilterBar.LeftItems>
            <Select
              name="appid"
              className="verification-details__app-select"
              options={options}
              value={"Application ID: " + (this.state.appId ? this.state.appId : "-")}
              clearable={false}
              searchable={false}
              onChange={this.onAppIdChange} />
          </FilterBar.LeftItems>
          <FilterBar.RightItems>
            <DateRangePicker
              withIcon={true}
              startDate={this.state.startDate}
              endDate={this.state.endDate}
              handleStartDateChange={this.handleStartDateChange}
              handleEndDateChange={this.handleEndDateChange} />
            <SearchBox
              value={this.state.number}
              placeHolder="Mobile number"
              onInputChangeHandler={this.handleSearchInputChange}
              onKeyPressHandler={this.handleSearchInputSubmit} />
          </FilterBar.RightItems>
        </FilterBar.Wrapper>

        <VerificationTable
          verifications={this.state.verifications}
          total={this.state.count}
          onLoadMoreClick={this.fetchMore} />
      </div>
    );
  }
});

export default VerificationDetails;
