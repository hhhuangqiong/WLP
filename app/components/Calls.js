import _ from 'lodash';
import moment from 'moment';
import {concurrent} from 'contra';
import classNames from 'classnames';

import React from 'react';
import FluxibleMixin from 'fluxible/addons/FluxibleMixin';
import {Link} from 'react-router';
import DatePicker from 'react-datepicker';

import AuthMixin from '../utils/AuthMixin';
import fetchCalls from '../actions/fetchCalls';

import CallsTable from './CallsTable';
import CallsStore from '../stores/CallsStore';

var Calls = React.createClass({
  contextTypes: {
    router: React.PropTypes.func.isRequired
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
          size: 10,
          page: query.page || 1,
          type: query.type || '',
          search: query.search || ''
        })
      ], done || function() {});
    }
  },

  getStateFromStores: function() {
    return {
      calls: this.getStore(CallsStore).getCalls(),
      callsCount: this.getStore(CallsStore).getCallsCount()
    };
  },

  getInitialState: function () {
    let query = _.merge({
      page: 1,
      size: 10,
      startDate: moment().subtract(2, 'day').startOf('day').format('L'),
      endDate: moment().endOf('day').format('L'),
      type: '',
      search: ''
    }, this.context.router.getCurrentQuery());

    return _.merge(this.getStateFromStores(), query);
  },

  onChange: function() {
    let query = _.merge({
      page: 1,
      size: 10,
      startDate: moment().subtract(2, 'day').startOf('day').format('L'),
      endDate: moment().endOf('day').format('L'),
      type: '',
      search: ''
    }, this.context.router.getCurrentQuery());

    this.setState(_.merge(this.getStateFromStores(), query));
  },

  getQueryFromState: function() {
    return {
      startDate: this.state.startDate && this.state.startDate.trim(),
      endDate: this.state.endDate && this.state.endDate.trim(),
      search: this.state.search && this.state.search.trim(),
      page: 1,
      size: this.state.size && parseInt(this.state.size),
      type: this.state.type && this.state.type.trim()
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

  handlePageChange: function(page) {
    this.handleQueryChange({ page: page });
  },

  handleStartDateChange: function(momentDate) {
    let date = moment(momentDate).format('L');
    this.handleQueryChange({ startDate: date, page: 1 });
  },

  handleEndDateChange: function(momentDate) {
    let date = moment(momentDate).format('L');
    this.handleQueryChange({ endDate: date, page: 1 });
  },

  handleOnnetClick: function(e) {
    e.preventDefault();

    let type = null;

    if (this.state.type !== 'ONNET') {
      type = 'ONNET'
    }

    this.handleQueryChange({ type: type });
  },

  handleOffnetClick: function(e) {
    e.preventDefault();

    let type = null;

    if (this.state.type !== 'OFFNET') {
      type = 'OFFNET'
    }

    this.handleQueryChange({ type: type });
  },

  handleUsernameChange: function(e) {
    this.setState({
      search: e.target.value
    });
  },

  handleSearchSubmit: function(e) {
    // on enter pressed
    if (e.which == 13) {
      this.handleQueryChange();
    }
  },

  _handleStartDateClick: function() {
    this.refs.startDatePicker.handleFocus();
  },

  _handleEndDateClick: function() {
    this.refs.endDatePicker.handleFocus();
  },

  render: function() {
    let params = this.context.router.getCurrentParams();

    return (
      <div className="row">
        <nav className="top-bar top-bar--inner">
          <div className="top-bar-section">
            <ul className="left top-bar--inner tab--inverted">
              <li className="top-bar--inner tab--inverted__title">
                <Link to="calls-overview" params={params}>Overview</Link>
              </li>
              <li className="top-bar--inner tab--inverted__title">
                <Link to="calls-details" params={params}>Details Report</Link>
              </li>
            </ul>

            <ul className="left top-bar--inner">
              <li className="top-bar--inner">
                <div className="date-range-picker left">
                  <i className="date-range-picker__icon icon-calendar left" />
                  <div className="date-input-wrap left" onClick={this._handleStartDateClick}>
                    <span className="left date-range-picker__date-span">{this.state.startDate}</span>
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
                    <span className="left date-range-picker__date-span">{this.state.endDate}</span>
                    <DatePicker
                      ref="endDatePicker"
                      key="end-date"
                      dateFormat="MM/DD/YYYY"
                      selected={moment(this.state.endDate, 'L')}
                      minDate={moment(this.state.startDate, 'L')}
                      onChange={this.handleEndDateChange}
                    />
                  </div>
                </div>
              </li>
            </ul>

            <div className="call-type-filter large-3 columns left top-bar-section">
              <ul className="button-group round">
                <li>
                  <a className={classNames('button', 'icon-onnet', { active: this.state.type == 'ONNET' })} onClick={this.handleOnnetClick}></a>
                </li>
                <li>
                  <a className={classNames('button', 'icon-offnet', { active: this.state.type == 'OFFNET' })} onClick={this.handleOffnetClick}></a>
                </li>
              </ul>
            </div>

            <div className="call-search top-bar-section right">
              <form onSubmit={this.handleSearchSubmit}>
                <input className="top-bar-section__query-input" type="text" placeholder="Username/Mobile" onChange={this.handleUsernameChange} onKeyPress={this.handleSearchSubmit} />
              </form>
            </div>
          </div>
        </nav>

        <div className="large-24 columns">
          <CallsTable
            totalRec={this.state.callsCount}
            calls={this.state.calls}
            page={this.state.page}
            pageRec={this.state.size}
            onPageChange={this.handlePageChange}
          />
        </div>
      </div>
    );
  }
});

export default Calls;
