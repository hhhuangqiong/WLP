import _ from 'lodash';
import moment from 'moment';

import React, { PropTypes } from 'react';
import { FluxibleMixin } from 'fluxible-addons-react';

import {
  injectIntl,
} from 'react-intl';

import loadSMS from '../actions/loadSMS';
import clearSMS from '../actions/clearSMS';

import SMSTable from './SMSTable';
import SMSStore from '../stores/SMSStore';
import AuthStore from '../../../main/stores/AuthStore';

import Export from '../../../main/file-export/components/Export';
import SmsExportForm from './SmsExportForm';

import { RESOURCE, ACTION, permission } from '../../../main/acl/acl-enums';
import i18nMessages from '../../../main/constants/i18nMessages';
import * as FilterBar from './../../../main/components/FilterBar';
import DateRangePicker from './../../../main/components/DateRangePicker';
import SearchBox from './../../../main/components/Searchbox';
import FilterBarNavigation from '../../../main/filter-bar/components/FilterBarNavigation';
import { SMS_COST, SMS } from '../../../main/file-export/constants/ExportType';

import config from './../../../main/config';
import * as dateLocale from '../../../utils/dateLocale';

const { inputDateFormat: DATE_FORMAT } = config;
const { pages: { topUp: { pageRec: PAGE_REC } } } = config;

// See: https://issuetracking.maaii.com:9443/display/MAAIIP/SMS+Search+API
// page = 0 1st page
const INITIAL_PAGE_NUMBER = 0;
const MONTHS_BEFORE_TODAY = 1;
const defaultLocale = dateLocale.getDefaultLocale();

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

const SmsPage = React.createClass({
  contextTypes: {
    router: PropTypes.object.isRequired,
    params: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
  },

  mixins: [FluxibleMixin],

  statics: {
    storeListeners: [SMSStore],
  },

  getInitialState() {
    const exportState = {
      exportType: SMS,
      exportTypeOptions: null,
    };
    return _.merge(
      _.clone(this.getDefaultQuery()), this.getRequestBodyFromQuery(), this.getStateFromStores(), exportState
    );
  },

  onChange() {
    this.setState(this.getStateFromStores());
  },

  componentDidMount() {
    this.fetchData();
    this.setExportTypeOptions();
  },

  componentDidUpdate(prevProps) {
    const { location: { search } } = this.props;
    const { location: { search: prevSearch } } = prevProps;

    if (search !== prevSearch) {
      this.context.executeAction(clearSMS);
      this.fetchData();
    }
  },

  componentWillUnmount() {
    this.context.executeAction(clearSMS);
  },

  fetchData() {
    const { executeAction, location: { query }, params } = this.context;
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

    executeAction(loadSMS, _.merge(_.clone(defaultQuery), getInitialQueryFromURL(params, query)));
  },

  setExportTypeOptions() {
    const { intl: { formatMessage } } = this.props;
    const SMS_EXPORT_OPTIONS = [{
      value: SMS,
      label: formatMessage(i18nMessages.usage),
    }, {
      value: SMS_COST,
      label: formatMessage(i18nMessages.retailPrice),
    }];
    const userPermissions = this.state.user.permissions;
    const exportTypeOptions = [];
    if (_.includes(userPermissions, permission(RESOURCE.SMS_EXPORT, ACTION.READ))) {
      exportTypeOptions.push(SMS_EXPORT_OPTIONS[0]);
    }
    if (_.includes(userPermissions, permission(RESOURCE.SMS_COST_EXPORT, ACTION.READ))) {
      exportTypeOptions.push(SMS_EXPORT_OPTIONS[1]);
    }
    if (exportTypeOptions.length === 1) {
      this.setState({ exportType: exportTypeOptions[0].value });
    }
    this.setState({ exportTypeOptions });
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
      user: this.getStore(AuthStore).getUser(),
    };
  },

  handleExportTypeChange(val = {}) {
    const value = val.value || '';
    this.setState({ exportType: value });
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
    const date = moment(momentDate.locale(defaultLocale)).format(DATE_FORMAT);

    this.setState({ startDate: date });
    this.handleQueryChange({ startDate: date, page: INITIAL_PAGE_NUMBER });
  },

  handleEndDateChange(momentDate) {
    const date = moment(momentDate.locale(defaultLocale)).format(DATE_FORMAT);

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

  render() {
    const { intl: { formatMessage } } = this.props;

    return (
      <div className="row">
        <FilterBar.Wrapper>
          <FilterBarNavigation section="sms" tab="details" />
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
          {
            !_.isEmpty(this.state.exportTypeOptions) ?
            <Export exportType={this.state.exportType}>
                <SmsExportForm
                  startDate={this.state.startDate}
                  endDate={this.state.endDate}
                  exportTypeOptions={this.state.exportTypeOptions}
                  disabled={this.state.exportTypeOptions.length === 1}
                  handleExportTypeChange={this.handleExportTypeChange}
                  exportType={this.state.exportType}
                />
            </Export> : null
          }
          <SearchBox
            placeHolder={formatMessage(i18nMessages.sender)}
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
});

export default injectIntl(SmsPage);
