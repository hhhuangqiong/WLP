import _ from 'lodash';
import moment from 'moment';
import {concurrent} from 'contra';
import classNames from 'classnames';

import React from 'react';
import {Link} from 'react-router';
import FluxibleMixin from 'fluxible/addons/FluxibleMixin';
import DatePicker from 'react-datepicker';

import AuthMixin from '../../../utils/AuthMixin';

import ImStore from '../stores/ImStore';

import fetchIm from '../actions/fetchIm';
import fetchMoreIms from '../actions/fetchMoreIms'

import ImTable from './ImTable';
import Searchbox from '../../../main/components/Searchbox';

import Export from '../../../main/file-export/components/Export';
import ImExportForm from './ImExportForm';

var config = require('../../../config');

const searchTypes = [
  { name: 'Sender', value: 'sender' },
  { name: 'Recipient', value: 'recipient' }
];

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
          fromTime: query.fromTime || moment().subtract(2, 'month').startOf('day').format('L'),
          toTime: query.toTime || moment().endOf('day').format('L'),
          type: query.type,
          searchType: query.searchType,
          search: query.search,
          size: config.PAGES.IMS.PAGE_SIZE,
          // The page number, starting from 0, defaults to 0 if not specified.
          page: query.page || 0
        })
      ], done || function() {});
    }
  },

  getStateFromStores: function() {
    return {
      ims: this.getStore(ImStore).getIMs(),
      imsCount: this.getStore(ImStore).getIMsCount(),
      page: this.getStore(ImStore).getPageNumber(),
      totalPages: this.getStore(ImStore).getTotalPages()
    };
  },

  getDefaultQuery: function() {
    return {
      // The page number, starting from 0, defaults to 0 if not specified.
      page: 0,
      size: config.PAGES.IMS.PAGE_SIZE,
      fromTime: moment().subtract(2, 'month').startOf('day').format('L'),
      toTime: moment().endOf('day').format('L'),
      type: '',
      search: '',
      searchType: ''
    };
  },

  getInitialState: function () {
    let defaultSearchType = _.first(searchTypes);
    let query = _.merge(this.getDefaultQuery(), this.context.router.getCurrentQuery(), { searchType: defaultSearchType.value });
    return _.merge(this.getStateFromStores(), query);
  },

  onChange: function() {
    let query = _.merge(this.getDefaultQuery(), this.context.router.getCurrentQuery());
    this.setState(_.merge(query, this.getStateFromStores()));
  },

  getQueryFromState: function() {
    return {
      fromTime: this.state.fromTime,
      toTime: this.state.toTime,
      searchType: this.state.searchType && this.state.searchType.trim(),
      search: this.state.search && this.state.search.trim(),
      page: 0,
      size: config.PAGES.IMS.PAGE_SIZE,
      type: this.state.type && this.state.type.trim()
    }
  },

  getDefaultMessageTypes: function() {
    return [
      {title: 'Text', value: 'text'},
      {title: 'Image', value: 'image'},
      {title: 'Audio', value: 'audio'},
      {title: 'Video', value: 'video'},
      {title: 'Remote', value: 'remote'},
      {title: 'Animation', value: 'animation'},
      {title: 'Sticker', value: 'sticker'},
      {title: 'Voice Sticker', value: 'voice_sticker'},
      {title: 'Ephemeral Image', value: 'ephemeral_image'}
    ]
  },

  handleQueryChange: function(newQuery) {
    let routeName = _.last(this.context.router.getCurrentRoutes()).name;
    let params = this.context.router.getCurrentParams();
    let query = _.merge(this.context.router.getCurrentQuery(), this.getQueryFromState(), newQuery);

    this.context.router.transitionTo(routeName, params, _.omit(query, function(value, key) {
      return !value || key === 'page' || key === 'size';
    }));
  },

  handlePageChange: function() {
    let { identity } = this.context.router.getCurrentParams();

    this.context.executeAction(fetchMoreIms, {
      carrierId: identity,
      fromTime: this.state.fromTime,
      toTime: this.state.toTime,
      page: +this.state.page + 1,
      size: config.PAGES.IMS.PAGE_SIZE,
      type: this.state.type,
      search: this.state.search,
      searchType: this.state.searchType
    });
  },

  handleStartDateChange: function(momentDate) {
    let date = moment(momentDate).format('L');
    this.handleQueryChange({ fromTime: date, page: 0 });
  },

  handleEndDateChange: function(momentDate) {
    let date = moment(momentDate).format('L');
    this.handleQueryChange({ toTime: date, page: 0 });
  },

  handleTypeChange: function(e) {
    e.preventDefault();
    let type = e.target.value;
    let _type = this.state.type !== type ? type : null;
    this.handleQueryChange({ type: _type });
  },

  getOptKey: function(messageType) {
    return `messageType-${messageType.value}`;
  },

  handleSearchChange: function(e) {
    let search = e.target.value;
    this.setState({ search: search });

    if (e.which == 13) {
      this.handleQueryChange({ search: search });
    }
  },

  handleSearchTypeChange: function(e) {
    let searchType = e.target.value;
    this.setState({ searchType: searchType });

    // only submit change if search input isn't empty
    if (this.state.search) {
      this.handleQueryChange({ searchType: searchType });
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
    let query = this.context.router.getCurrentQuery();

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
                    <span className="left date-range-picker__date-span">{this.state.fromTime}</span>
                    <DatePicker
                      ref="startDatePicker"
                      key="start-date"
                      dateFormat="MM/DD/YYYY"
                      selected={moment(this.state.fromTime, 'L')}
                      maxDate={moment(this.state.toTime, 'L')}
                      onChange={this.handleStartDateChange}
                      />
                  </div>
                  <i className="date-range-picker__separator left">-</i>
                  <div className="date-input-wrap left" onClick={this._handleEndDateClick}>
                    <span className="left date-range-picker__date-span">{this.state.toTime}</span>
                    <DatePicker
                      ref="endDatePicker"
                      key="end-date"
                      dateFormat="MM/DD/YYYY"
                      selected={moment(this.state.toTime, 'L')}
                      minDate={moment(this.state.fromTime, 'L')}
                      maxDate={moment()}
                      onChange={this.handleEndDateChange}
                      />
                  </div>
                </div>
              </li>
            </ul>

            <div className="im-type large-2 columns left top-bar-section">
              <select className={classNames('top-bar-section__message-type-select','left')} name="messageTypeDropDown" onChange={this.handleTypeChange}>
                <option key={'messageType-default'} value="">Choose</option>
                {this.getDefaultMessageTypes().map((messageType)=>{
                  return <option key={this.getOptKey(messageType)} value={messageType.value} selected={messageType.value === query.type}>{messageType.title}</option>;
                })}
              </select>
            </div>

            <div className="right">
              <Export exportType="Im">
                <ImExportForm
                  fromTime={this.state.fromTime}
                  toTime={this.state.toTime}
                />
              </Export>
            </div>

            <div className="im-search top-bar-section right">
              <Searchbox
                searchTypes={searchTypes}
                placeHolder="Username/Mobile"
                onSelectChangeHandler={this.handleSearchTypeChange}
                onKeyPressHandler={this.handleSearchChange}
                />
            </div>
          </div>
        </nav>

        <div className="large-24 columns">
          <ImTable
            ims={this.state.ims}
            totalRec={this.state.imsCount}
            page={parseInt(this.state.page)}
            pageRec={this.state.size}
            totalPages={this.state.totalPages}
            onDataLoad={this.handlePageChange}
            />
        </div>
      </div>
    );
  }
});

export default Im;
