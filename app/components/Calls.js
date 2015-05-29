// TODO need to fix empty data after refresh problem


import moment from 'moment';
import {concurrent} from 'contra';

import React from 'react';
import FluxibleMixin from 'fluxible/addons/FluxibleMixin';
import DatePicker from 'react-datepicker';

import AuthMixin from '../utils/AuthMixin';

import CallsStore from '../stores/CallsStore';

import {fetchCalls} from '../actions/fetchCalls';
import {fetchCallsPage} from '../actions/fetchCallsPage';

import CallsTable from './CallsTable';
import Pagination from './Pagination';

var getFromTime = function(dateString=moment()) {
  return (_.isEmpty(dateString)) ? moment().local().startOf('day').format('x') : moment(dateString).local().startOf('day').format('x');
}

var getToTime = function(dateString=moment()) {
  return (_.isEmpty(dateString)) ? moment().local().endOf('day').format('x') : moment(dateString).local().endOf('day').format('x');
}

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
          fromTime: query.fromTime || getFromTime(moment().startOf('month')),
          toTime: query.toTime || getToTime(),
          size: 10,
          page: query.page || 1
        })
      ], done || function() {});
    }
  },

  getInitialState: function () {
    let params = this.context.router.getCurrentParams();
    let query = this.context.router.getCurrentQuery();
    return {
      current: 1,
      per: 10,
      calls: this.getStore(CallsStore).getCalls(),
      callsCount: this.getStore(CallsStore).getCallsCount(),
      carrierId: params.identity,
      startDate: moment().startOf('month'),
      endDate: moment().endOf('day'),
      type: '',
      search: '',
      minDate: moment().subtract(1,'year'),
      maxDate: moment(),
    };
  },

  onChange: function() {
    let state = this.getStore(CallsStore).getState();
    this.setState(state);
  },

  getNewCurrentPage(per, nextPer) {
    return Math.ceil(this.state.current * per / nextPer);
  },

  handlePerChange: function(e) {
    let per = e.target.value;
    this.setState({
     current: this.getNewCurrentPage(this.state.per, per),
     per: per
    })
  },

  handlePageChange: function(page) {
    this.executeAction(fetchCallsPage, {
      carrierId: this.state.carrierId,
      fromTime: getFromTime(this.state.startDate),
      toTime: getToTime(this.state.endDate),
      type: this.state.type,
      size: this.state.per,
      page: +page-1 || 0
    });

    this.setState({
      current: page,
      pageNumber: page
    });
  },

  handleStartDateChange: function(date) {
    this.executeAction(fetchCallsPage, {
      carrierId: this.state.carrierId,
      fromTime: getFromTime(date),
      toTime: getToTime(this.state.endDate),
      type: this.state.type,
      size: this.state.per,
      page: 0
    });

    this.setState({
      startDate: date,
      current: 1
    });
  },

  handleEndDateChange: function(date) {
    this.executeAction(fetchCallsPage, {
      carrierId: this.state.carrierId,
      fromTime: getFromTime(this.state.startDate),
      toTime: getToTime(date),
      type: this.state.type,
      search: this.state.search,
      size: this.state.per,
      page: 0
    });

    this.setState({
      endDate: date,
      current: 1
    });
  },

  handleOnnetClick: function(e) {
    e.preventDefault();

    this.executeAction(fetchCallsPage, {
      carrierId: this.state.carrierId,
      fromTime: getFromTime(this.state.startDate),
      toTime: getToTime(this.state.endDate),
      type: 'ONNET',
      search: this.state.search,
      size: this.state.per,
      page: 0
    });

    this.setState({
      type: 'ONNET'
    });
  },

  handleOffnetClick: function(e) {
    e.preventDefault();

    this.executeAction(fetchCallsPage, {
      carrierId: this.state.carrierId,
      fromTime: getFromTime(this.state.startDate),
      toTime: getToTime(this.state.endDate),
      type: 'OFFNET',
      search: this.state.search,
      size: this.state.per,
      page: 0
    });

    this.setState({
      type: 'OFFNET'
    });
  },

  handleSearchSubmit: function(e) {
    e.preventDefault();

    this.executeAction(fetchCallsPage, {
      carrierId: this.state.carrierId,
      fromTime: getFromTime(this.state.startDate),
      toTime: getToTime(this.state.endDate),
      type: this.state.type,
      search: this.state.search,
      size: this.state.per,
      page: 0
    });
  },

  handleSearchChange: function(e) {
    this.setState({
      search: e.target.value
    });

    this.executeAction(fetchCallsPage, {
      carrierId: this.state.carrierId,
      fromTime: getFromTime(this.state.startDate),
      toTime: getToTime(this.state.endDate),
      type: this.state.type,
      search: this.state.search,
      size: this.state.per,
      page: 0
    });
  },

  render: function() {
    return (
      <div className="row">
        <dl className="sub-nav">
          <div className="start-date-wrap large-2 large-offset-1 columns left">
            <DatePicker
              key="start-date"
              dateFormat="MM/DD/YYYY"
              selected={this.state.startDate}
              minDate={this.state.minDate}
              maxDate={this.state.maxDate}
              onChange={this.handleStartDateChange}
            />
          </div>
          <div className="end-date-wrap large-2 large-offset-0 columns left">
            <DatePicker
              key="end-date"
              dateFormat="MM/DD/YYYY"
              selected={this.state.endDate}
              minDate={this.state.minDate}
              maxDate={this.state.maxDate}
              onChange={this.handleEndDateChange}
            />
          </div>
          <div className="call-type-filter large-2 columns left">
            <ul className="button-group round">
              <li><a className="button icon-onnet" onClick={this.handleOnnetClick}></a></li>
              <li><a className="button icon-offnet" onClick={this.handleOffnetClick}></a></li>
            </ul>
          </div>
          <div className="call-search large-3 columns right">
            <form onSubmit={this.handleSearchSubmit}>
              <input type="text" placeholder="Username/Mobile" onChange={this.handleSearchChange} />
            </form>
          </div>
        </dl>
        
        <div className="large-24 columns">
            <CallsTable calls={this.state.calls} current={this.state.current} per={this.state.per} />
            <Pagination total={this.state.callsCount} current={this.state.current} per={this.state.per} onPageChange={this.handlePageChange} />
        </div>
      </div>
    );
  }
});

export default Calls;
