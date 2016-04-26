import _ from 'lodash';
import moment from 'moment';
import { concurrent } from 'contra';

import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import { FluxibleMixin } from 'fluxible-addons-react';
import { FormattedMessage } from 'react-intl';

import loadSMS from '../actions/loadSMS';
import clearSMS from '../actions/clearSMS';

import SMSTable from './SMSTable';
import SMSStore from '../stores/SMSStore';

import * as FilterBar from './../../../main/components/FilterBar';
import DateRangePicker from './../../../main/components/DateRangePicker';
import SearchBox from './../../../main/components/Searchbox';

import config from './../../../main/config';
const { inputDateFormat: DATE_FORMAT } = config;
const { pages: { topUp: { pageRec: PAGE_REC } } } = config;

// See: https://issuetracking.maaii.com:9443/display/MAAIIP/SMS+Search+API
// page = 0 1st page
const INITIAL_PAGE_NUMBER = 0;
const MONTHS_BEFORE_TODAY = 1;

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

const SMS = React.createClass({
  contextTypes: {
    router: PropTypes.func.isRequired,
    params: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
  },

  mixins: [FluxibleMixin],

  statics: {
    storeListeners: [SMSStore],

    fetchData(context, params, query, done) {
      const defaultQuery = {
        carrierId: null,
        startDate: moment()
          .startOf('day')
          .subtract(MONTHS_BEFORE_TODAY, 'month')
          .format(DATE_FORMAT),
        endDate: moment().endOf('day').format(DATE_FORMAT),
        number: null,
        page: INITIAL_PAGE_NUMBER,
        pageRec: PAGE_REC,
      };

      concurrent([
        context.executeAction.bind(context, clearSMS, {}),
        context.executeAction.bind(
          context,
          loadSMS,
          _.merge(_.clone(defaultQuery), getInitialQueryFromURL(params, query))
        ),
      ], done || (() => {}));
    },
  },

  getInitialState() {
    return _.merge(
      _.clone(this.getDefaultQuery()), this.getRequestBodyFromQuery(), this.getStateFromStores()
    );
  },

  onChange() {
    this.setState(this.getStateFromStores());
  },

  componentWillUnmount() {
    this.context.executeAction(clearSMS);
  },

  getDefaultQuery() {
    return {
      carrierId: null,
      startDate: moment().startOf('day').subtract(MONTHS_BEFORE_TODAY, 'month').format(DATE_FORMAT),
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

  getStateFromStores() {
    return {
      page: this.getStore(SMSStore).getPage(),
      totalPage: this.getStore(SMSStore).getTotalPage(),
      isLoadingMore: this.getStore(SMSStore).isLoadingMore,
    };
  },

  render() {
    const { role, identity } = this.context.params;

    return (
      <div className="row">
        <FilterBar.Wrapper>
          <FilterBar.NavigationItems>
            <Link
              to={`/${role}/${identity}/sms/overview`}
              activeClassName="active"
            >
              <FormattedMessage id="overview" defaultMessage="Overview" />
            </Link>
            <Link
              to={`/${role}/${identity}/sms/details`}
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
            <SearchBox
              placeHolder="Sender"
              value={this.state.number}
              onInputChangeHandler={this.handleSearchInputChange}
              onKeyPressHandler={this.handleSearchInputSubmit}
            />
          </FilterBar.RightItems>
        </FilterBar.Wrapper>
        <div className="large-24 columns">
          <SMSTable
            totalPage={this.state.totalPage}
            records={this.getStore(SMSStore).getSMS()}
            page={this.state.page}
            onPageLoad={this.handlePageLoad}
            isLoadingMore={this.state.isLoadingMore}
          />
        </div>
      </div>
    );
  },

  handleQueryChange(newQuery) {
    const query = _.merge(this.getRequestBodyFromQuery(), this.getRequestBodyFromState(), newQuery);

    this.context.router.push({
      pathname: this.context.location.pathname,
      query: _.omit(query, value => !value),
    });
  },

  // action for client side
  // so properties in state will domainate
  handlePageLoad() {
    const targetPage = +this.state.page + 1;

    this.setState({
      page: targetPage,
    });

    this.context.executeAction(
      loadSMS,
      _.merge(this.getRequestBodyFromState(), { page: targetPage })
    );
  },

  handleStartDateChange(momentDate) {
    const date = moment(momentDate).format(DATE_FORMAT);

    this.setState({ startDate: date });
    this.handleQueryChange({ startDate: date, page: INITIAL_PAGE_NUMBER });
  },

  handleEndDateChange(momentDate) {
    const date = moment(momentDate).format(DATE_FORMAT);

    this.setState({ endDate: date });
    this.handleQueryChange({ endDate: date, page: INITIAL_PAGE_NUMBER });
  },

  handleSearchInputChange(e) {
    this.setState({ number: e.target.value });
  },

  handleSearchInputSubmit(e) {
    if (e.which === 13) {
      this.handleQueryChange({ number: e.target.value, page: INITIAL_PAGE_NUMBER });
    }
  },
});

export default SMS;
