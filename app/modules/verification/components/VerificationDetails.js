import _ from 'lodash';
import moment from 'moment';

import React, { PropTypes } from 'react';
import { FluxibleMixin } from 'fluxible-addons-react';
import { Link } from 'react-router';
import {
  FormattedMessage,
  injectIntl,
  defineMessages,
} from 'react-intl';

import * as FilterBar from './../../../main/components/FilterBar';
import DateRangePicker from './../../../main/components/DateRangePicker';

import fetchVerifications from '../actions/fetchVerifications';
import fetchMoreVerifications from '../actions/fetchMoreVerifications';
import clearVerifications from '../actions/resetVerificationData';

import VerificationStore from '../stores/VerificationStore';
import ApplicationStore from '../../../main/stores/ApplicationStore';

import VerificationTable from './VerificationTable';
import config from '../../../config';

import Export from '../../../main/file-export/components/Export';
import VerificationExportForm from './VerificationExportForm';
import VerificationFilter from './VerificationFilter';

import SearchButton from '../../../main/search-button/SearchButton';
import i18nMessages from '../../../main/constants/i18nMessages';
import FilterBarNavigation from '../../../main/filter-bar/components/FilterBarNavigation';

const debug = require('debug')('app:modules/verification/components/VerificationDetails');

const ENTER_KEY = 13;
const LABEL_OF_ALL = i18nMessages.all;

import MESSAGES from '../../../main/constants/i18nMessages';
import * as dateLocale from '../../../utils/dateLocale';

const VERIFICATION_TYPES = [
  MESSAGES.callIn,
  MESSAGES.callOut,
  MESSAGES.sms,
  MESSAGES.ivr,
];

const OS_TYPES = [
  'ios',
  'android',
];

const defaultLocale = dateLocale.getDefaultLocale();

const { inputDateFormat: DATE_FORMAT } = require('./../../../main/config');

const VerificationDetails = React.createClass({
  propTypes: {
    appIds: PropTypes.array.isRequired,
  },

  contextTypes: {
    router: PropTypes.object.isRequired,
    params: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    executeAction: PropTypes.func.isRequired,
  },

  mixins: [FluxibleMixin],

  statics: {
    storeListeners: {
      onChange: VerificationStore,
      onApplicationStoreChange: ApplicationStore,
    },
  },

  /**
   * @typedef {Object} VerificationDetails~State
   * @property {String} appId  The application ID for the report, for remote API
   * @property {Object[]} verifications  The list of verification records
   * @property {Number} page  The current page number, starting from 0, for remote API
   * @property {Number} maxPage  The total number of pages
   * @property {Number} size  The page size, for remote API
   * @property {String} startDate
   *   The start date the verification report in 'MM/DD/YYYY' format, for remote API
   * @property {String} endDate
   *   The end date of the verification report in 'MM/DD/YYYY' format, for remote API
   * @property {String} number  The search query for the number number, for remote API
   * @property {String} method  The verification method, for remote API
   * @property {String} os  The OS of the end user's mobile device, for remote API
   */
  getInitialState() {
    const query = _.merge(this.getDefaultQuery(),
      this
        .context
        .location
        .query
    );
    return _.merge(this.getStateFromStores(), query);
  },

  getDefaultQuery() {
    return {
      // The page number, starting from 0, defaults to 0 if not specified.
      page: 0,
      size: config.PAGES.VERIFICATIONS.PAGE_SIZE,
      startDate: moment().subtract(2, 'month').startOf('day').format(DATE_FORMAT),
      endDate: moment().endOf('day').format(DATE_FORMAT),
      number: '',
      method: '',
      os: '',
    };
  },

  getQueryFromState() {
    return {
      appId: this.state.appId,
      startDate: this.state.startDate && this.state.startDate.trim(),
      endDate: this.state.endDate && this.state.endDate.trim(),
      number: this.state.number && this.state.number.trim(),
      page: 0,
      size: config.PAGES.VERIFICATIONS.PAGE_SIZE,
      method: this.state.method && this.state.method.trim(),
      os: this.state.os && this.state.os.trim(),
    };
  },

  getStateFromStores() {
    const store = this.getStore(VerificationStore);

    return {
      verifications: store.getVerifications(),
      page: store.getPageNumber(),
      maxPage: store.getPageCount(),
      count: store.getVerificationCount(),
      isLoadingMore: store.isLoadingMore,
    };
  },

  componentDidMount() {
    // auto select the default appId from the list
    // TODO: optimize this UX with server side rendering

    // appId has been selected, no need to auto select
    if (this.state.appId) {
      this.fetchData();
      return;
    }

    const { appId } = this.context.location.query;

    // no default, cannot select and fetch
    // proper fetch will be done after onApplicationStoreChange
    if (!appId) {
      this.autoSelectAppId();
      return;
    }

    // auto select without modifying the query string
    this.setState({
      appId,
    });
  },

  componentDidUpdate(prevProps, prevState) {
    const { location: { search } } = this.props;
    const { location: { search: prevSearch } } = prevProps;

    if ((search !== prevSearch) || (prevState.appId !== this.state.appId)) {
      this.context.executeAction(clearVerifications);
      this.fetchData();
    }
  },

  componentWillUnmount() {
    this.context.executeAction(clearVerifications);
  },

  onChange() {
    let query = _.merge(this.getDefaultQuery(), this.context.location.query);
    this.setState(_.merge(query, this.getStateFromStores()));
  },

  /**
   * Auto select the default appId when the ApplicationStore updates.
   * Selection will happen only if no appId is currently selected.
   *
   * @method
   */
  onApplicationStoreChange() {
    // do nothing if there is a selected appId, otherwise select the default
    if (this.state.appId) {
      return;
    }

    this.autoSelectAppId();
  },

  onAppIdChange(val) {
    this.setState({
      appId: val,
    });

    this.handleQueryChange({
      appId: val,
      page: 0,
    });
  },

  handleStartDateChange(dateString) {
    const date = moment(dateString.locale(defaultLocale)).format(DATE_FORMAT);
    this.handleQueryChange({ startDate: date, page: 0 });
  },

  handleEndDateChange(dateString) {
    const date = moment(dateString.locale(defaultLocale)).format(DATE_FORMAT);
    this.handleQueryChange({ endDate: date, page: 0 });
  },

  _handleStartDateClick() {
    this
      .refs
      .startDatePicker
      .handleFocus();
  },

  _handleEndDateClick() {
    this
      .refs
      .endDatePicker
      .handleFocus();
  },

  handleSearchInputChange(evt) {
    this.setState({
      number: evt.target.value,
    });
  },

  handleSearchInputSubmit(evt) {
    if (evt.which === ENTER_KEY) {
      this.handleQueryChange({ number: evt.target.value, page: 0 });
    }
  },

  handleVerificationMethodChange(event) {
    const methodId = event.target.value;

    let method = '';

    switch (methodId) {
      case MESSAGES.callIn.id:
        method = MESSAGES.callIn.defaultMessage;
        break;
      case MESSAGES.callOut.id:
        method = MESSAGES.callOut.defaultMessage;
        break;
      case MESSAGES.sms.id:
        method = MESSAGES.sms.defaultMessage;
        break;
      case MESSAGES.ivr.id:
        method = MESSAGES.ivr.defaultMessage;
        break;
      default:
        break;
    }

    this.setState({
      method,
    });

    this.handleQueryChange({ method });
  },

  transformMethodToId(method) {
    switch (method) {
      case 'call-in':
        return 'vsdk.details.callIn';
      case 'call-out':
        return 'vsdk.details.callOut';
      case 'sms':
        return 'vsdk.details.sms';
      case 'ivr':
        return 'vsdk.details.ivr';
      default:
        return '';
    }
  },

  handleOsTypeChange(event) {
    const { intl: { formatMessage } } = this.props;
    const value = event.target.value;
    this.handleQueryChange({ os: value === formatMessage(LABEL_OF_ALL) ? '' : value });
  },

  fetchData() {
    if (!this.state.appId) {
      debug('appId is not ready, stop fetching data.');
      return;
    }

    const { query } = this.context.location;
    const { identity } = this.context.params;

    this.context.executeAction(fetchVerifications, {
      carrierId: identity,
      appId: this.state.appId,
      pageSize: this.state.pageSize,
      startDate: query.startDate || this.state.startDate,
      endDate: query.endDate || this.state.endDate,
      number: this.state.number,
      os: query.os,
      method: query.method,
    });
  },

  /**
   * Fetch the verification events by advancing the page number.
   *
   * @method
   */
  fetchMore() {
    const { identity } = this
      .context
      .params;

    const nextPage = this.state.page + 1;

    this.setState({
      page: nextPage,
    });

    this.context.executeAction(fetchMoreVerifications, {
      carrierId: identity,
      appId: this.state.appId,
      page: nextPage,
      pageSize: this.state.pageSize,
      startDate: this.state.startDate,
      endDate: this.state.endDate,
      number: this.state.number,
      os: this.state.os,
      method: this.state.method,
    });
  },

  /**
   * Selects the default application ID according to the ApplicationStore.
   * This will change the state `appId`.
   *
   * @method
   */
  autoSelectAppId() {
    this.onAppIdChange(this
      .context
      .getStore(ApplicationStore)
      .getDefaultAppId()
    );
  },

  handleQueryChange(newQuery) {
    const query = _.merge(
      this
        .context
        .location
        .query,
      this.getQueryFromState(),
      newQuery
    );

    const changedQuery = _.omit(query, value => !value);

    this.context.router.push({
      pathname: this.context.location.pathname,
      query: changedQuery,
    });
  },

  render() {
    const { intl: { formatMessage } } = this.props;
    const { role, identity } = this
      .context
      .params;

    const options = [];

    const { appIds } = this.props;

    appIds.forEach(item => {
      options.push({
        value: item,
        label: item,
      });
    });

    return (
      <div className="row verification-details">
        <FilterBar.Wrapper>
          <FilterBarNavigation section="verification-sdk" tab="details" />
          <FilterBar.LeftItems>
            <VerificationFilter
              appId={this.state.appId}
              appIdOptions={options}
              appIdChange={this.onAppIdChange}
              os={this.state.os}
              osTypes={OS_TYPES}
              osChange={this.handleOsTypeChange}
              method={this.transformMethodToId(this.state.method)}
              methods={VERIFICATION_TYPES}
              methodChange={this.handleVerificationMethodChange}
              defaultOption={formatMessage(LABEL_OF_ALL)}
            />
            <DateRangePicker
              withIcon
              startDate={this.state.startDate}
              endDate={this.state.endDate}
              handleStartDateChange={this.handleStartDateChange}
              handleEndDateChange={this.handleEndDateChange}
            />
          </FilterBar.LeftItems>
          <FilterBar.RightItems>
            <SearchButton
              placeHolder={formatMessage(i18nMessages.mobile)}
              value={this.state.number}
              onInputChangeHandler={this.handleSearchInputChange}
              onKeyPressHandler={this.handleSearchInputSubmit}
            />
            <Export exportType="Verification">
              <VerificationExportForm
                fromTime={this.state.startDate}
                toTime={this.state.endDate}
                verificationType={this.transformMethodToId(this.state.method)}
                verificationTypes={VERIFICATION_TYPES}
                osType={this.state.os}
                osTypes={OS_TYPES}
                handleVerificationMethodChange={this.handleVerificationMethodChange}
                handleOsTypeChange={this.handleOsTypeChange}
                defaultOption={formatMessage(LABEL_OF_ALL)}
              />
            </Export>
          </FilterBar.RightItems>
        </FilterBar.Wrapper>
        <VerificationTable
          verifications={this.state.verifications}
          total={this.state.count}
          onLoadMoreClick={this.fetchMore}
          isLoadingMore={this.state.isLoadingMore}
        />
      </div>
    );
  },
});

export default injectIntl(VerificationDetails);
