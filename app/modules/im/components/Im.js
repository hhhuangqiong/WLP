import _, { merge, omit } from 'lodash';
import moment from 'moment';
import { concurrent } from 'contra';
import classNames from 'classnames';

import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import { FluxibleMixin } from 'fluxible-addons-react';
import DatePicker from 'react-datepicker';
import { FormattedMessage } from 'react-intl';

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
    router: PropTypes.object.isRequired,
    location: PropTypes.object,
    params: PropTypes.object,
  },

  mixins: [FluxibleMixin],

  statics: {
    storeListeners: [ImStore],
  },

  getInitialState() {
    const defaultSearchType = _.first(searchTypes);

    const query = _.merge(
      this.getDefaultQuery(),
      this.context.location.query,
      { searchType: defaultSearchType.value }
    );

    return _.merge(this.getStateFromStores(), query);
  },

  componentDidMount() {
    this.fetchData();
  },

  componentDidUpdate(prevProps) {
    const { location: { search } } = this.props;
    const { location: { search: prevSearch } } = prevProps;

    if (search !== prevSearch) {
      this.context.executeAction(clearIm);
      this.fetchData();
    }
  },

  componentWillUnmount() {
    this.context.executeAction(clearIm);
  },

  onChange() {
    const query = _.merge(this.getDefaultQuery(), this.context.location.query);
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
      { title: 'Text', value: 'text' },
      { title: 'Image', value: 'image' },
      { title: 'Audio', value: 'audio' },
      { title: 'Video', value: 'video' },
      { title: 'Remote', value: 'remote' },
      { title: 'Animation', value: 'animation' },
      { title: 'Sticker', value: 'sticker' },
      { title: 'Voice Sticker', value: 'voice_sticker' },
      { title: 'Ephemeral Image', value: 'ephemeral_image' },
    ];
  },

  getOptKey(messageType) {
    return `messageType-${messageType.value}`;
  },

  fetchData() {
    const { executeAction, location: { query }, params } = this.context;
    executeAction(fetchIm, {
      carrierId: params.identity,
      fromTime: query.fromTime || moment().subtract(2, 'month').startOf('day').format('L'),
      toTime: query.toTime || moment().endOf('day').format('L'),
      type: query.type,
      searchType: query.searchType,
      search: query.search,
      size: config.PAGES.IMS.PAGE_SIZE,
      // The page number, starting from 0, defaults to 0 if not specified.
      page: query.page || 0,
    });
  },

  handleQueryChange(newQuery) {
    const query = merge(
      this.context.location.query,
      this.getQueryFromState(),
      newQuery
    );

    const queryWithoutNull = omit(query, (value, key) => (
      !value || key === 'page' || key === 'size'
    ));

    const { pathname } = this.context.location;

    this.context.router.push({
      pathname,
      query: queryWithoutNull,
    });
  },

  handlePageChange() {
    const { identity } = this.context.params;

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
    this.setState({ search });

    if (e.which === 13) {
      this.handleQueryChange({ search });
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
    this.refs.startDatePicker.handleFocus();
  },

  _handleEndDateClick() {
    this.refs.endDatePicker.handleFocus();
  },

  render() {
    const { role, identity } = this.context.params;
    const query = this.context.location.query;

    return (
      <div className="row">
        <nav className="top-bar top-bar--inner">
          <div className="top-bar-section">
            <ul className="left top-bar--inner tab--inverted">
              <li className="top-bar--inner tab--inverted__title">
                <Link
                  to={`/${role}/${identity}/im/overview`}
                  activeClassName="active"
                >
                  <FormattedMessage id="overview" defaultMessage="Overview" />
                </Link>
              </li>
              <li className="top-bar--inner tab--inverted__title">
                <Link
                  to={`/${role}/${identity}/im/details`}
                  activeClassName="active"
                >
                  <FormattedMessage id="detailsReport" defaultMessage="Details Report" />
                </Link>
              </li>
            </ul>

            <ul className="left top-bar--inner">
              <li className="top-bar--inner">
                <div className="date-range-picker left">
                  <i className="date-range-picker__icon icon-calendar left" />
                  <div className="date-input-wrap left" onClick={this._handleStartDateClick}>
                    <span
                      className="interactive-button left date-range-picker__start"
                    >{this.state.fromTime}</span>
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
                    <span
                      className="interactive-button left date-range-picker__end"
                    >{this.state.toTime}</span>
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
              <select
                className={classNames('top-bar-section__message-type-select', 'left')}
                name="messageTypeDropDown"
                onChange={this.handleTypeChange}
              >
                <option key={'messageType-default'} value="">Choose</option>
                {this.getDefaultMessageTypes().map(messageType => {
                  return (
                    <option
                      key={this.getOptKey(messageType)}
                      value={messageType.value}
                      selected={messageType.value === query.type}
                    >{messageType.title}</option>
                  );
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
});

export default Im;
