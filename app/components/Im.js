import _ from 'lodash';
import moment from 'moment';
import {concurrent} from 'contra';

import React from 'react';
import FluxibleMixin from 'fluxible/addons/FluxibleMixin';
import DatePicker from 'react-datepicker';

import AuthMixin from '../utils/AuthMixin';

import ImStore from '../stores/ImStore';

import {fetchIm} from '../actions/fetchIm';

import ImTable from './ImTable';
import LoadingSpinner from './common/LoadingSpinner';

var getFromTime = function(dateString=moment()) {
  return (_.isEmpty(dateString)) ? moment().local().startOf('day').format('x') : moment(dateString).local().startOf('day').format('x');
}

var getToTime = function(dateString=moment()) {
  return (_.isEmpty(dateString)) ? moment().local().endOf('day').format('x') : moment(dateString).local().endOf('day').format('x');
}

var Im = React.createClass({
  contextTypes: {
    router: React.PropTypes.func.isRequired
  },

  mixins: [FluxibleMixin, AuthMixin],

  statics: {
    storeListeners: [ImStore],

    fetchData: function(context, params, query, done) {
      concurrent([
        context.executeAction.bind(context, fetchIm, {
          carrierId: params.identity,
          fromTime: query.fromTime || getFromTime(moment().subtract(2,'month').startOf('day')),
          toTime: query.toTime || getToTime(),
          size: 10,
          page: query.page || 0
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
      calls: this.getStore(ImStore).getCalls(),
      callsCount: this.getStore(ImStore).getCallsCount(),
      carrierId: params.identity,
      startDate: moment().subtract(2,'month').startOf('day'),
      endDate: moment().endOf('day'),
      type: '',
      search: '',
      minDate: moment().subtract(1,'year'),
      maxDate: moment(),
    };
  },

  onChange: function() {
    let state = this.getStore(ImStore).getState();
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
    this.executeAction(fetchIm, {
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
    this.executeAction(fetchIm, {
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
    this.executeAction(fetchIm, {
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

  handleTextTypeClick: function(e) {
    e.preventDefault();

    this.executeAction(fetchIm, {
      carrierId: this.state.carrierId,
      fromTime: getFromTime(this.state.startDate),
      toTime: getToTime(this.state.endDate),
      type: 'text',
      search: this.state.search,
      size: this.state.per,
      page: 0
    });

    this.setState({
      type: 'text'
    });
  },

  handleImageTypeClick: function(e) {
    e.preventDefault();

    this.executeAction(fetchIm, {
      carrierId: this.state.carrierId,
      fromTime: getFromTime(this.state.startDate),
      toTime: getToTime(this.state.endDate),
      type: 'image',
      search: this.state.search,
      size: this.state.per,
      page: 0
    });

    this.setState({
      type: 'image'
    });
  },

  handleAudioTypeClick: function(e) {
    e.preventDefault();

    this.executeAction(fetchIm, {
      carrierId: this.state.carrierId,
      fromTime: getFromTime(this.state.startDate),
      toTime: getToTime(this.state.endDate),
      type: 'audio',
      search: this.state.search,
      size: this.state.per,
      page: 0
    });

    this.setState({
      type: 'audio'
    });
  },

  handleVideoTypeClick: function(e) {
    e.preventDefault();

    this.executeAction(fetchIm, {
      carrierId: this.state.carrierId,
      fromTime: getFromTime(this.state.startDate),
      toTime: getToTime(this.state.endDate),
      type: 'video',
      search: this.state.search,
      size: this.state.per,
      page: 0
    });

    this.setState({
      type: 'video'
    });
  },

  handleOtherTypeClick: function(e) {
    e.preventDefault();

    this.executeAction(fetchIm, {
      carrierId: this.state.carrierId,
      fromTime: getFromTime(this.state.startDate),
      toTime: getToTime(this.state.endDate),
      type: 'other',
      search: this.state.search,
      size: this.state.per,
      page: 0
    });

    this.setState({
      type: 'other'
    });
  },

  handleSearchSubmit: function(e) {
    e.preventDefault();

    this.executeAction(fetchIm, {
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
  },

  handleTypeChange: function(actionContext, payload, done) {
    let status = _.merge(this.state.type,payload);
    this.setState({type:status});
  },

  render: function() {
    return (
      <div className="row">
        <nav className="top-bar top-bar--inner">
          <div className="top-bar-section">
            <ul className="left top-bar--inner tab--inverted">
              <li className="top-bar--inner tab--inverted__title">
                <a className="" href="">Overview</a>
              </li>
              <li className="top-bar--inner tab--inverted__title">
                <a className="active" href="">Details Report</a>
              </li>
            </ul>
            <div className="start-date-wrap large-2 columns left">
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

            <div className="im-type large-2 columns left top-bar-section">
              <ul className="button-group round">
                <li><a className="button icon-text" onClick={this.handleTextTypeClick}></a></li>
                <li><a className="button icon-image" onClick={this.handleImageTypeClick}></a></li>
                <li><a className="button icon-audio" onClick={this.handleAudioTypeClick}></a></li>
                <li><a className="button icon-video" onClick={this.handleVideoTypeClick}></a></li>
                <li><a className="button icon-ituneyoutube" onClick={this.handleOtherTypeClick}></a></li>
              </ul>
            </div>

            <div className="im-search large-3 columns right">
              <form onSubmit={this.handleSearchSubmit}>
                <input type="text" placeholder="Username/Mobile" onChange={this.handleSearchChange} />
              </form>
            </div>
          </div>
        </nav>

        <div className="large-24 columns">
            <ImTable im={this.state.calls} total={this.state.callsCount} current={this.state.current} per={this.state.per} onPageChange={this.handlePageChange} />
        </div>
        <LoadingSpinner/>
      </div>
    );
  }
});

export default Im;
