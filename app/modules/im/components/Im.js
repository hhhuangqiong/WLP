import _ from 'lodash';
import moment from 'moment';
import { concurrent } from 'contra';
import classNames from 'classnames';

import React from 'react';
import { Link } from 'react-router';
import FluxibleMixin from 'fluxible/addons/FluxibleMixin';
import DatePicker from 'react-datepicker';

import AuthMixin from '../../../utils/AuthMixin';

import ImStore from '../stores/ImStore';

import clearIm from '../actions/clearIm';
import fetchIm from '../actions/fetchIm';
import fetchMoreIms from '../actions/fetchMoreIms';

import ImTable from './ImTable';
import Searchbox from '../../../main/components/Searchbox';

import Export from '../../../main/file-export/components/Export';
import ImExportForm from './ImExportForm';

import config from '../../../config';

const searchTypes = [
  { name: 'Sender', value: 'sender' },
  { name: 'Recipient', value: 'recipient' },
];

const Im = React.createClass({
  contextTypes: {
    router: React.PropTypes.func.isRequired,
  },

  mixins: [FluxibleMixin, AuthMixin],

  statics: {
    storeListeners: [ImStore],

    fetchData(context, params, query, done) {
      concurrent([
        context.executeAction.bind(context, clearIm, {}),
        context.executeAction.bind(context, fetchIm, {
          carrierId: params.identity,
          fromTime: query.fromTime || moment().subtract(2, 'month').startOf('day').format('L'),
          toTime: query.toTime || moment().endOf('day').format('L'),
          type: query.type,
          searchType: query.searchType,
          search: query.search,
          size: config.PAGES.IMS.PAGE_SIZE,
          // The page number, starting from 0, defaults to 0 if not specified.
          page: query.page || 0,
        }),
      ], done || () => {});
    },
  },

  getInitialState() {
    const defaultSearchType = _.first(searchTypes);
    const query = _.merge(this.getDefaultQuery(), this.context.router.getCurrentQuery(), { searchType: defaultSearchType.value });
    return _.merge(this.getStateFromStores(), query);
  },

  componentWillUnmount() {
    this.context.executeAction(clearIm);
  },

  onChange() {
    const query = _.merge(this.getDefaultQuery(), this.context.router.getCurrentQuery());
    this.setState(_.merge(query, this.getStateFromStores()));
  },

  getStateFromStores() {
    return {
      ims: this.getStore(ImStore).getIMs(),
      imsCount: this.getStore(ImStore).getIMsCount(),
      page: this.getStore(ImStore).getPageNumber(),
      totalPages: this.getStore(ImStore).getTotalPages(),
      isLoadingMore: this.getStore(ImStore).isLoadingMore,
    };
  },

  getDefaultQuery() {
    return {
      // The page number, starting from 0, defaults to 0 if not specified.
      page: 0,
      size: config.PAGES.IMS.PAGE_SIZE,
      fromTime: moment().subtract(2, 'month').startOf('day').format('L'),
      toTime: moment().endOf('day').format('L'),
      type: '',
      search: '',
      searchType: '',
    };
  },

  getQueryFromState() {
    return {
      fromTime: this.state.fromTime,
      toTime: this.state.toTime,
      searchType: this.state.searchType && this.state.searchType.trim(),
      search: this.state.search && this.state.search.trim(),
      page: 0,
      size: config.PAGES.IMS.PAGE_SIZE,
      type: this.state.type && this.state.type.trim(),
    };
  },

  getDefaultMessageTypes() {
    return [
      {title: 'Text', value: 'text'},
      {title: 'Image', value: 'image'},
      {title: 'Audio', value: 'audio'},
      {title: 'Video', value: 'video'},
      {title: 'Remote', value: 'remote'},
      {title: 'Animation', value: 'animation'},
      {title: 'Sticker', value: 'sticker'},
      {title: 'Voice Sticker', value: 'voice_sticker'},
      {title: 'Ephemeral Image', value: 'ephemeral_image'},
    ];
  },

  getOptKey(messageType) {
    return `messageType-${messageType.value}`;
  },

  render() {
    const params = this.context.router.getCurrentParams();
    const query = this.context.router.getCurrentQuery();

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
                    <span className="interactive-button left date-range-picker__date-span">{this.state.fromTime}</span>
                    <DatePicker
                      ref="startDatePicker"
                      key="start-date"
                      dateFormat="MM/DD/YYYY"
                      selected={moment(this.state.fromTime, 'L')}
                      minDate={moment().subtract(1, 'years')}
                      maxDate={moment(this.state.toTime, 'L')}
                      onChange={this.handleStartDateChange}
                      />
                  </div>
                  <i className="date-range-picker__separator left">-</i>
                  <div className="date-input-wrap left" onClick={this._handleEndDateClick}>
                    <span className="interactive-button left date-range-picker__date-span">{this.state.toTime}</span>
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
              <select className={classNames('top-bar-section__message-type-select', 'left')} name="messageTypeDropDown" onChange={this.handleTypeChange}>
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
                value={this.state.search}
                searchTypes={searchTypes}
                placeHolder="Username/Mobile"
                onSelectChangeHandler={this.handleSearchTypeChange}
                onInputChangeHandler={this.handleSearchChange}
                onKeyPressHandler={this.handleSearchChange}
                />
            </div>
          </div>
        </nav>

        <div className="large-24 columns">
          <ImTable
            ims={this.state.ims}
            totalRec={this.state.imsCount}
            page={parseInt(this.state.page, 10)}
            pageRec={this.state.size}
            totalPages={this.state.totalPages}
            onDataLoad={this.handlePageChange}
            isLoadingMore={this.state.isLoadingMore}
          />
        </div>
      </div>
    );
  },

  handleQueryChange(newQuery) {
    const routeName = _.last(this.context.router.getCurrentRoutes()).name;
    const params = this.context.router.getCurrentParams();
    const query = _.merge(this.context.router.getCurrentQuery(), this.getQueryFromState(), newQuery);

    this.context.router.transitionTo(routeName, params, _.omit(query, (value, key) => {
      return !value || key === 'page' || key === 'size';
    }));
  },

  handlePageChange() {
    const { identity } = this.context.router.getCurrentParams();

    this.context.executeAction(fetchMoreIms, {
      carrierId: identity,
      fromTime: this.state.fromTime,
      toTime: this.state.toTime,
      page: this.state.page,
      size: config.PAGES.IMS.PAGE_SIZE,
      type: this.state.type,
      search: this.state.search,
      searchType: this.state.searchType,
    });
  },

  handleStartDateChange(momentDate) {
    const date = moment(momentDate).format('L');
    this.handleQueryChange({ fromTime: date, page: 0 });
  },

  handleEndDateChange(momentDate) {
    const date = moment(momentDate).format('L');
    this.handleQueryChange({ toTime: date, page: 0 });
  },

  handleTypeChange(e) {
    e.preventDefault();
    const type = e.target.value;
    const _type = this.state.type !== type ? type : null;
    this.handleQueryChange({ type: _type });
  },

  handleSearchChange(e) {
    const search = e.target.value;
    this.setState({ search: search });

    if (e.which === 13) {
      this.handleQueryChange({ search: search });
    }
  },

  handleSearchTypeChange(e) {
    const searchType = e.target.value;
    this.setState({ searchType: searchType });

    // only submit change if search input isn't empty
    if (this.state.search) {
      this.handleQueryChange({ searchType: searchType });
    }
  },

  _handleStartDateClick() {
    this.refs.startDatePicker.handleFocus();
  },

  _handleEndDateClick() {
    this.refs.endDatePicker.handleFocus();
  },
});

export default Im;
