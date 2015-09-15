import _ from 'lodash';
import moment from 'moment';
import {concurrent} from 'contra';
import classNames from 'classnames';

import React from 'react';
import FluxibleMixin from 'fluxible/addons/FluxibleMixin';
import {Link} from 'react-router';

import DatePicker from 'react-datepicker';
import Select from 'react-select';

import AuthMixin from '../../../utils/AuthMixin';

import * as FilterBar from './../../../main/components/FilterBar';
import DateRangePicker from './../../../main/components/DateRangePicker';

import fetchVerifications from '../actions/fetchVerifications';
import fetchMoreVerifications from '../actions/fetchMoreVerifications';

import VerificationStore from '../stores/VerificationStore';

import VerificationTableRow from './VerificationTableRow'
import config from '../../../config';

const debug = require('debug')('app:verification/components/Verification');

let { inputDateFormat: DATE_FORMAT } = require('./../../../main/config');

var VerificationDetails = React.createClass({
  contextTypes: {
    router: React.PropTypes.func.isRequired,
    executeAction: React.PropTypes.func.isRequired
  },

  mixins: [FluxibleMixin, AuthMixin],

  statics: {
    storeListeners: [VerificationStore],

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
        search: query.search,
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
   * @property {String} search  The search query for the phone number, for remote API
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
      search: '',
      method: '',
      os: ''
    };
  },

  getQueryFromState: function() {
    return {
      appId: this.state.appId,
      startDate: this.state.startDate && this.state.startDate.trim(),
      endDate: this.state.endDate && this.state.endDate.trim(),
      search: this.state.search && this.state.search.trim(),
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
    // auto select the first appId from the list
    // TODO: optimize this UX with server side rendering

    // appId has selected, no need to auto select
    if (this.state.appId) {
      return;
    }

    this.autoSelectAppId();
  },

  autoSelectAppId: function () {
    // no appIds for some reasons
    if (!this.props.appIds || !this.props.appIds.length) {
      return;
    }

    // select the first item as default
    this.onAppIdChange(this.props.appIds[0]);
  },

  loadMore: function () {
    let { identity } = this.context.router.getCurrentParams();

    this.context.executeAction(fetchMoreVerifications, {
      carrierId: identity,
      appId: this.state.appId,
      page: this.state.page + 1,
      pageSize: this.state.pageSize,
      startDate: this.state.startDate,
      endDate: this.state.endDate,
      search: this.state.search,
      os: this.state.os,
      method: this.state.method
    });
  },

  onChange: function () {
    let query = _.merge(this.getDefaultQuery(), this.context.router.getCurrentQuery());
    this.setState(_.merge(query, this.getStateFromStores()));
  },

  onAppIdChange: function (val) {
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

  renderTableRows: function () {
    let rows = this.state.verifications.map(item => {
      return (
        <VerificationTableRow key={item.id} verification={item} />
      );
    });

    return rows;
  },

  renderPaginationFooter: function () {
    if (this.state.page < this.state.maxPage - 1) {
      return (<div className="pagination__button text-center" onClick={this.loadMore}>Load More</div>);
    } else {
      return (<div className="pagination__button pagination__button--inactive text-center">no more result</div>);
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

    let tableRows = this.renderTableRows(this.state.verifications);
    let tableFooter = this.renderPaginationFooter();

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
              onChange={this.onAppIdChange}
            />
          </FilterBar.LeftItems>
          <FilterBar.RightItems>
            <DateRangePicker
              withIcon={true}
              startDate={this.state.startDate}
              endDate={this.state.endDate}
              handleStartDateChange={this.handleStartDateChange}
              handleEndDateChange={this.handleEndDateChange}
            />
          </FilterBar.RightItems>
        </FilterBar.Wrapper>

        <table className="data-table small-24 large-22 large-offset-1">
          <thead>
            <tr>
              <th>DATE &amp; TIME</th>
              <th>MOBILE</th>
              <th>SOURCE IP</th>
              <th>METHOD</th>
              <th>OS</th>
              <th>DEVICE MODEL</th>
              <th>OPERATOR</th>
              <th>RESULT</th>
              <th className="text-center">REMARKS</th>
            </tr>
          </thead>
          <tbody className="verification-table">
            {tableRows}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="9" className="pagination">
                {tableFooter}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    );
  }
});

export default VerificationDetails;
