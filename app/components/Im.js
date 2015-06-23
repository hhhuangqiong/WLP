// TODO need to fix empty data after refresh problem

import _ from 'lodash';
import moment from 'moment';
import {concurrent} from 'contra';
import classNames from 'classnames';

import React from 'react';
import {Link} from 'react-router';
import FluxibleMixin from 'fluxible/addons/FluxibleMixin';
import DatePicker from 'react-datepicker';

import AuthMixin from '../utils/AuthMixin';

import ImStore from '../stores/ImStore';

import {fetchIm} from '../actions/fetchIm';

import ImTable from './ImTable';
import Searchbox from './Searchbox';

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
      let startDate = (query.startDate) ? getFromTime(query.startDate) : undefined;
      let endDate = (query.endDate) ? getToTime(query.endDate) : undefined;
      concurrent([
        context.executeAction.bind(context, fetchIm, {
          carrierId: params.identity,
          fromTime: startDate || getFromTime(moment().subtract(2,'month').startOf('day')),
          toTime: endDate || getToTime(),
          type: query.type,
          searchType: query.searchType,
          search: query.search,
          size: 10,
          page: +query.page-1 || 0
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
      searchType: '',
      search: '',
      startMinDate: moment().subtract(2,'month'),
      startMaxDate: moment(),
      endMinDate: moment().subtract(2,'month'),
      endMaxDate: moment(),
    }, query);

    query.startMinDate = moment(query.endDate).subtract(2,'month');
    query.startMaxDate = query.endDate;
    query.endMinDate = query.startDate;
    query.endMaxDate = moment();

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

    currentQuery.startMinDate = moment(currentQuery.endDate).subtract(2,'month');
    currentQuery.startMaxDate = currentQuery.endDate;
    currentQuery.endMinDate = currentQuery.startDate;
    currentQuery.endMaxDate = moment();

    let state = this.getStateFromStores();
    let query = _.merge({
      page: 1,
      size: 10,
      startDate: moment().subtract(2, 'month').startOf('day'),
      endDate: moment().endOf('day'),
      type: '',
      searchType: '',
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
      searchType: this.state.searchType && this.state.searchType.trim(),
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
    query.type = (!_.isUndefined(newQuery.type)) ? newQuery.type : currentState.type;
    query.searchType = (!_.isUndefined(newQuery.searchType)) ? newQuery.searchType : currentState.searchType;
    query.search = (!_.isUndefined(newQuery.search)) ? newQuery.search : currentState.search;
    query.page = (!_.isUndefined(newQuery.page)) ? newQuery.page : currentState.page;

    query = _.pick(query, ['startDate','endDate','type','searchType','search','page'] );

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
    if (this.state.endDate.diff(date) > 0)
      this.handleQueryChange({ fromTime: getFromTime(date) });
  },

  handleEndDateChange: function(date) {
    if (date.diff(this.state.startDate) >= 0)
      this.handleQueryChange({ toTime: getToTime(date) });
  },

  handleTextTypeClick: function(e) {
    e.preventDefault();
    let type = null;
    if (this.state.type !== 'text') {
      type = 'text'
    }
    this.handleQueryChange({ type: type });
  },

  handleImageTypeClick: function(e) {
    e.preventDefault();
    let type = null;
    if (this.state.type !== 'image') {
      type = 'image'
    }
    this.handleQueryChange({ type: type });
  },

  handleAudioTypeClick: function(e) {
    e.preventDefault();
    let type = null;
    if (this.state.type !== 'audio') {
      type = 'audio'
    }
    this.handleQueryChange({ type: type });
  },

  handleVideoTypeClick: function(e) {
    e.preventDefault();
    let type = null;
    if (this.state.type !== 'video') {
      type = 'video'
    }
    this.handleQueryChange({ type: type });
  },

  handleOtherTypeClick: function(e) {
    e.preventDefault();
    let type = null;
    if (this.state.type !== 'remote') {
      type = 'remote'
    }
    this.handleQueryChange({ type: type });
  },

  handleSearchSubmit: function(e) {
    e.preventDefault();
  },

  handleSearchChange: function(e) {
    let search = e.target.value;
    this.setState({search:search});
    if (e.which == 13) {
      this.handleQueryChange({ search: search });
    }
  },

  handleSearchTypeChange: function(e) {
    let searchType = e.target.value;
    this.setState({searchType:searchType});
    this.handleQueryChange({searchType:searchType});
  },

  handleTypeChange: function(actionContext, payload, done) {
    let status = _.merge(this.state.type,payload);
    console.log(status);
    this.setState({type:status});
  },

  _handleStartDateClick: function() {
    this.refs.startDatePicker.handleFocus();
  },

  _handleEndDateClick: function() {
    this.refs.endDatePicker.handleFocus();
  },

  render: function() {
    let params = this.context.router.getCurrentParams();

    let startDate = moment(this.state.startDate).format("MM/DD/YYYY");
    let endDate = moment(this.state.endDate).format("MM/DD/YYYY");

    let searchTypes = [
        {name:'Sender', value: 'sender'},{name:'Recipient', value: 'recipient'}
    ];

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

            <ul className="left top-bar--inner">
              <li className="top-bar--inner">
                <div className="date-range-picker left">
                  <i className="date-range-picker__icon icon-calendar left" />
                  <div className="date-input-wrap left" onClick={this._handleStartDateClick}>
                    <span className="left date-range-picker__date-span">{startDate}</span>
                    <DatePicker
                      ref="startDatePicker"
                      key="start-date"
                      dateFormat="MM/DD/YYYY"
                      selected={this.state.startDate}
                      minDate={this.state.startMinDate}
                      maxDate={this.state.startMaxDate}
                      onChange={this.handleStartDateChange}
                    />
                  </div>
                  <i className="date-range-picker__separator left">-</i>
                  <div className="date-input-wrap left" onClick={this._handleEndDateClick}>
                    <span className="left date-range-picker__date-span">{endDate}</span>
                    <DatePicker
                      ref="endDatePicker"
                      key="end-date"
                      dateFormat="MM/DD/YYYY"
                      selected={this.state.endDate}
                      minDate={this.state.endMinDate}
                      maxDate={this.state.endMaxDate}
                      onChange={this.handleEndDateChange}
                    />
                  </div>
                </div>
              </li>
            </ul>

            <div className="im-type large-2 columns left top-bar-section">
              <ul className="button-group round">
                <li><a className={classNames('button', 'icon-text', { active: this.state.type == 'text' })} onClick={this.handleTextTypeClick}></a></li>
                <li><a className={classNames('button', 'icon-image', { active: this.state.type == 'image' })} onClick={this.handleImageTypeClick}></a></li>
                <li><a className={classNames('button', 'icon-audio', { active: this.state.type == 'audio' })} onClick={this.handleAudioTypeClick}></a></li>
                <li><a className={classNames('button', 'icon-video', { active: this.state.type == 'video' })} onClick={this.handleVideoTypeClick}></a></li>
                <li><a className={classNames('button', 'icon-ituneyoutube', { active: this.state.type == 'remote' })} onClick={this.handleOtherTypeClick}></a></li>
              </ul>
            </div>

            <div className="im-search top-bar-section right">
              <Searchbox searchTypes={searchTypes} placeHolder="Username/Mobile" onSelectChangeHandler={this.handleSearchTypeChange} onKeyPressHandler={this.handleSearchChange} />
            </div>
          </div>
        </nav>

        <div className="large-24 columns">
            <ImTable im={this.state.calls} total={this.state.callsCount} current={parseInt(this.state.page)} per={this.state.per} onPageChange={this.handlePageChange} />
        </div>

      </div>
    );
  }
});

export default Im;
