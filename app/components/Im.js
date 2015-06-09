import _ from 'lodash';
import moment from 'moment';
import {concurrent} from 'contra';

import React from 'react';
import {Link} from 'react-router';
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
    let prevState = this.getStateFromStores();

    query.startDate = (query.startDate) ? moment(query.startDate, "MM/DD/YYYY").startOf('day') : undefined;
    query.endDate = (query.endDate) ? moment(query.endDate, "MM/DD/YYYY").endOf('day'): undefined;

    query = _.merge({
      current: query.page || 1,
      per: 10,
      pageNumber: query.page || 1,
      calls: this.getStore(ImStore).getCalls(),
      callsCount: this.getStore(ImStore).getCallsCount(),
      carrierId: params.identity,
      startDate: moment().subtract(2,'month').startOf('day'),
      endDate: moment().endOf('day'),
      type: '',
      search: '',
      minDate: moment().subtract(1,'year'),
      maxDate: moment(),
    }, query);

    return _.merge(this.getStateFromStores(), query);
  },

  onChange: function() {
    let currentQuery = _.omit(this.context.router.getCurrentQuery(),function(value) {return !value;});
    if (currentQuery.startDate) {
      currentQuery.startDate = moment(currentQuery.startDate, "MM/DD/YYYY").startOf('day');
    }
    if (currentQuery.endDate) {
      currentQuery.endDate = moment(currentQuery.endDate, "MM/DD/YYYY").endOf('day');
    }

    let state = this.getStateFromStores();
    let query = _.merge({
      page: 1,
      size: 10,
      startDate: moment().subtract(2, 'month').startOf('day'),
      endDate: moment().endOf('day'),
      type: '',
      search: ''
    }, currentQuery);

    this.setState(_.merge(state, query));
  },

  getStateFromStores: function() {
    return {
      calls: this.getStore(ImStore).getCalls(),
      callsCount: this.getStore(ImStore).getCallsCount()
    };
  },

  getQueryFromState: function() {
    return {
      startDate: this.state.startDate.format('L'),
      endDate: this.state.endDate.format('L'),
      search: this.state.search && this.state.search.trim(),
      page: 1,
      size: this.state.size && parseInt(this.state.size),
      type: this.state.type && this.state.type.trim()
    }
  },

  handleQueryChange: function(newQuery) {
    let currentState = this.getQueryFromState();
    let routeName = _.last(this.context.router.getCurrentRoutes()).name;
    let params = this.context.router.getCurrentParams();
    let query = _.merge(this.context.router.getCurrentQuery(), currentState, newQuery);

    query.startDate = (newQuery.fromTime) ? moment(newQuery.fromTime,'x').format('L') : currentState.startDate;
    query.endDate = (newQuery.toTime) ? moment(newQuery.toTime,'x').format('L') : currentState.endDate;
    query.type = (newQuery.type) ? newQuery.type : currentState.type;
    query.search = (newQuery.search) ? newQuery.search : currentState.search;
    query.page = (newQuery.page) ? newQuery.page : currentState.page;

    query = _.pick(query, ['startDate','endDate','type','search','page'] );

    this.context.router.transitionTo(routeName, params, _.omit(query, function(value) {
      return !value;
    }));
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
    this.handleQueryChange({ page: parseInt(page), current: parseInt(page) });
  },

  handleStartDateChange: function(date) {
    this.handleQueryChange({ fromTime: getFromTime(date) });
  },

  handleEndDateChange: function(date) {
    this.handleQueryChange({ toTime: getToTime(date) });
  },

  handleTextTypeClick: function(e) {
    e.preventDefault();
    this.handleQueryChange({ type: 'text' });
  },

  handleImageTypeClick: function(e) {
    e.preventDefault();
    this.handleQueryChange({ type: 'image' });
  },

  handleAudioTypeClick: function(e) {
    e.preventDefault();
    this.handleQueryChange({ type: 'audio' });
  },

  handleVideoTypeClick: function(e) {
    e.preventDefault();
    this.handleQueryChange({ type: 'video' });
  },

  handleOtherTypeClick: function(e) {
    e.preventDefault();
    this.handleQueryChange({ type: 'sharing' });
  },

  handleSearchSubmit: function(e) {
    e.preventDefault();
    this.handleQueryChange({ search: this.state.search });
  },

  handleSearchChange: function(e) {
    if (e.which == 13) {
      this.handleQueryChange({ search: this.state.search });
    }
  },

  handleTypeChange: function(actionContext, payload, done) {
    let status = _.merge(this.state.type,payload);
    this.setState({type:status});
  },

  render: function() {
    let params = this.context.router.getCurrentParams();

    return (
      <div className="row">
        <nav className="top-bar top-bar--inner">
          <div className="top-bar-section">
            <ul className="left top-bar--inner tab--inverted">
              <li className="top-bar--inner tab--inverted__title">
                <Link to="im-overview" params={params}>Overview</Link>
              </li>
              <li className="top-bar--inner tab--inverted__title">
                <Link to="im" params={params}>Details Report</Link>
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
            <ImTable im={this.state.calls} total={this.state.callsCount} current={parseInt(this.state.page)} per={this.state.per} onPageChange={this.handlePageChange} />
        </div>
        <LoadingSpinner/>
      </div>
    );
  }
});

export default Im;
