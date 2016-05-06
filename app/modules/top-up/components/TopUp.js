import { omit, merge, last, clone } from 'lodash';
import moment from 'moment';
import { concurrent } from 'contra';

import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import { FormattedMessage } from 'react-intl';
import { FluxibleMixin } from 'fluxible-addons-react';

import loadTransactions from '../actions/loadTransactions';
import clearTopUp from '../actions/clearTopUp';

import TopUpTable from './TopUpTable';
import TopUpStore from '../stores/TopUpStore';

import * as FilterBar from './../../../main/components/FilterBar';
import DateRangePicker from './../../../main/components/DateRangePicker';
import SearchBox from './../../../main/components/Searchbox';
import Tooltip from './../../../main/components/Tooltip';

const { inputDateFormat: DATE_FORMAT } = require('./../../../main/config');
const { pages: { topUp: { pageRec: PAGE_REC } } } = require('./../../../main/config');

// See: https://issuetracking.maaii.com:9443/display/HKBoss/Maaii+Payment#MaaiiPayment-GetTransactionHistory
// page = 0 shows only total records
// page = 1 1st page
const INITIAL_PAGE_NUMBER = 1;

// WLP-323
const MAX_QUERY_DATE_RANGE = 7;

const ONLY_NUMBER_MESSAGE = 'Only numbers are allowed.';

function getInitialQueryFromURL(params, query = {}) {
  return {
    carrierId: params.identity,
    startDate: query.startDate,
    endDate: query.endDate,
    number: query.number,
    page: query.page,
    pageRec: query.pageRec,
  };
}

const TopUp = React.createClass({
  contextTypes: {
    router: PropTypes.object.isRequired,
    params: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
  },

  mixins: [FluxibleMixin],

  statics: {
    storeListeners: [TopUpStore],

    fetchData(context, params, query, done) {
      const defaultQuery = {
        carrierId: null,
        startDate: moment()
          .startOf('day')
          .subtract(MAX_QUERY_DATE_RANGE, 'days')
          .format(DATE_FORMAT),
        endDate: moment().endOf('day').format(DATE_FORMAT),
        number: null,
        page: INITIAL_PAGE_NUMBER,
        pageRec: PAGE_REC,
      };

      concurrent([
        context.executeAction.bind(context, clearTopUp, {}),
        context.executeAction.bind(
          context,
          loadTransactions,
          merge(clone(defaultQuery),
          getInitialQueryFromURL(params, query), { reload: true })
        ),
      ], done || (() => {}));
    },
  },

  getInitialState() {
    return merge(
      clone(this.getDefaultQuery()), this.getRequestBodyFromQuery(), this.getStateFromStores()
    );
  },

  onChange() {
    this.setState(this.getStateFromStores());
  },

  componentWillUnmount() {
    this.context.executeAction(clearTopUp);
  },

  getStateFromStores() {
    return {
      totalRec: this.getStore(TopUpStore).getTotalRec(),
      page: this.getStore(TopUpStore).getPage(),
      isLoadingMore: this.getStore(TopUpStore).isLoadingMore,
    };
  },

  getDefaultQuery() {
    return {
      carrierId: null,
      startDate: moment().startOf('day').subtract(MAX_QUERY_DATE_RANGE, 'days').format(DATE_FORMAT),
      endDate: moment().endOf('day').format(DATE_FORMAT),
      number: null,
      page: INITIAL_PAGE_NUMBER,
      pageRec: PAGE_REC,
    };
  },

  getRequestBodyFromQuery(query) {
    const { startDate, endDate, number, page, pageRec } = query || this.context.location.query;
    return { startDate, endDate, number, page, pageRec };
  },

  getRequestBodyFromState() {
    const { identity } = this.context.params;
    const { startDate, endDate, number, page, pageRec } = this.state;
    return { carrierId: identity, startDate, endDate, number, page, pageRec };
  },

  render() {
    const { role, identity } = this.context.params;

    return (
      <div className="row">
        <FilterBar.Wrapper>
          <FilterBar.NavigationItems>
            <Link
              to={`/${role}/${identity}/top-up/details`}
              activeClassName="active"
            >
              <FormattedMessage id="detailsReport" defaultMessage="Details Report" />
            </Link>
          </FilterBar.NavigationItems>
          <FilterBar.LeftItems>
            <DateRangePicker
              withIcon
              startDate={this.state.startDate}
              endDate={this.state.endDate}
              handleStartDateChange={this.handleStartDateChange}
              handleEndDateChange={this.handleEndDateChange}
            />
          </FilterBar.LeftItems>
          <FilterBar.RightItems>
            <Tooltip
              showTooltip={this.state.tooltipShow}
              mouseActive={false}
              cssName="top-up"
              tip={ONLY_NUMBER_MESSAGE}
              placement="left"
            >
              <SearchBox
                value={this.state.number}
                placeHolder="Mobile"
                onInputChangeHandler={this.handleSearchInputChange}
                onKeyPressHandler={this.handleSearchInputSubmit}
              />
            </Tooltip>
          </FilterBar.RightItems>
        </FilterBar.Wrapper>
        <div className="large-24 columns">
          <TopUpTable
            totalRec={this.state.totalRec}
            histories={this.getStore(TopUpStore).getHistories()}
            page={this.state.page}
            pageRec={this.state.pageRec}
            onPageLoad={this.handlePageLoad}
            isLoadingMore={this.state.isLoadingMore}
          />
        </div>
      </div>
    );
  },

  handleQueryChange(newQuery) {
    const query = merge(this.getRequestBodyFromQuery(), this.getRequestBodyFromState(), newQuery);

    const requiredKey = ['number'];

    /* Should not omit null value as 'number' field is always required even it is null */
    const sanitizedQuery = omit(query || {}, (value, key) => (
      !value && requiredKey.indexOf(key) === -1
    ));

    this.context.router.push({
      pathname: this.context.location.pathname,
      query: sanitizedQuery,
    });
  },

  // action for client side
  // so properties in state will domainate
  handlePageLoad() {
    const targetPage = +this.state.page + 1;

    this.setState({
      page: targetPage,
    });

    this.context.executeAction(loadTransactions, merge(this.getRequestBodyFromState(), { page: targetPage }));
  },

  handleStartDateChange(momentDate) {
    const date = moment(momentDate).format(DATE_FORMAT);

    const updates = { startDate: date };

    if (moment(this.state.endDate, 'L').diff(momentDate, 'days') > MAX_QUERY_DATE_RANGE) {
      updates.endDate = moment(momentDate).add(MAX_QUERY_DATE_RANGE, 'days').format(DATE_FORMAT);
    }

    this.setState(updates);

    updates.page = INITIAL_PAGE_NUMBER;

    this.handleQueryChange(updates);
  },

  handleEndDateChange(momentDate) {
    const date = moment(momentDate).format(DATE_FORMAT);

    const updates = { endDate: date };

    if (moment(momentDate).diff(moment(this.state.startDate, 'L'), 'days') > MAX_QUERY_DATE_RANGE) {
      updates.startDate = moment(momentDate).subtract(MAX_QUERY_DATE_RANGE, 'days').format(DATE_FORMAT);
    }

    this.setState(updates);

    updates.page = INITIAL_PAGE_NUMBER;
    this.handleQueryChange(updates);
  },

  handleSearchInputChange(e) {
    if (!this.validateSearchInput(e.target.value)) {
      this.showTooltip();
      return;
    }

    this.hideTooltip();
    this.setState({ number: e.target.value });
  },

  handleSearchInputSubmit(e) {
    if ( e.which === 13 && this.validateSearchInput(e.target.value) ) {
      this.handleQueryChange({ number: e.target.value, page: INITIAL_PAGE_NUMBER });
    }
  },

  validateSearchInput(number) {
    if (!number) return true;

    const regex = /^\d+$/;
    return regex.test(number);
  },

  showTooltip() {
    this.setState({tooltipShow: true});
  },

  hideTooltip() {
    this.setState({tooltipShow: false});
  },
});

export default TopUp;
