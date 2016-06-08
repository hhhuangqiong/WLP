import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import Select from 'react-select';
import classNames from 'classnames';
import moment from 'moment';
import { isNull, max, merge, sortByOrder, some, values } from 'lodash';

import {
  FormattedMessage,
  defineMessages,
  injectIntl,
  intlShape,
} from 'react-intl';

import { FluxibleMixin } from 'fluxible-addons-react';

import * as FilterBar from './../../../main/components/FilterBar';
import * as Panel from './../../../main/components/Panel';
import getMapConfig from '../../../main/statistics/utils/getMapConfig';
import ColorRadioButton from '../../../main/components/ColorRadioButton';
import TimeFramePicker from '../../../main/components/TimeFramePicker';
import { parseTimeRange } from '../../../utils/timeFormatter';
import LineChart from '../../../main/components/LineChart';
import DonutChartPanel from '../../../main/components/DonutChartPanel';
import SummaryCells from './SummaryCells';
import fetchVerificationOverview from '../actions/fetchVerificationOverview';
import resetVerificationData from '../actions/resetVerificationData';
import VerificationOverviewStore from '../stores/VerificationOverviewStore';
import ApplicationStore from '../../../main/stores/ApplicationStore';
import { normalizeDurationInMS, timeFromNow } from '../../../utils/StringFormatter';
import MAP_DATA from '../../../main/statistics/constants/mapData.js';
import changeTimeRange from '../actions/changeTimeRange';
import i18nMessages from '../../../main/constants/i18nMessages';
import FilterBarNavigation from '../../../main/filter-bar/components/FilterBarNavigation';
import * as dateLocale from '../../../utils/dateLocale';

const TIME_FRAMES = ['24 hours', '7 days', '30 days', '60 days', '90 days'];
const DEFAULT_TIME_RANGE = '30 days';
const TOTAL_NUMBER_ATTEMPTS = 'totalNumberAttempts';
const SUCCESS_ATTEMPTS_NUMBER = 'successAttemptsNumber';
const SUCCESS_ATTEMPTS_RATE = 'successAttemptsRate';
const EMPTY_CELL_PLACEHOLDER = '-';

// Maintain time format like this Sep 25, 2015 2:40 PM for tooltip
const TOOLTIP_TIME_FORMAT = 'lll';

function fromTimeslot(collection, fromTime, timeframe) {
  const maxNumber = max(collection);

  // Map the index to real world numbers representing the number of hours/days
  const maxIndex = collection.indexOf(maxNumber) + 1;

  const subtractedFromTime = timeFromNow(timeframe);
  return subtractedFromTime.add(maxIndex, timeframe.indexOf('hours') > -1 ? 'hours' : 'days');
}

import METHOD_MESSAGES from '../../../main/constants/i18nMessages';

const MESSAGES = defineMessages({
  totalNumbersOfVerificationAttempts: {
    id: 'verification.overview.totalNumbersOfVerificationAttempts',
    defaultMessage: 'Totals numbers of verification attempts',
  },
  successVerificationAttempts: {
    id: 'verification.overview.successVerificationAttempts',
    defaultMessage: 'Success verification attempts',
  },
  successVerificationRate: {
    id: 'verification.overview.successVerificationRate',
    defaultMessage: 'Success verification rate',
  },
  successVerificationUnit: {
    id: 'verification.overview.successVerificationUnit',
    defaultMessage: 'success',
  },
  numberOfVerificationAttempts: {
    id: 'verification.overview.numberOfAttempt',
    defaultMessage: 'Number of attempts',
  },
});

const VerificationOverview = React.createClass({
  displayName: 'VerificationOverview',

  propTypes: {
    intl: intlShape.isRequired,
    appIds: PropTypes.array,
  },

  contextTypes: {
    router: PropTypes.object.isRequired,
    executeAction: PropTypes.func.isRequired,
    location: PropTypes.object.isRequired,
    params: PropTypes.object.isRequired,
  },

  mixins: [FluxibleMixin],

  statics: {
    storeListeners: {
      onVerificationOverviewChange: VerificationOverviewStore,
      onApplicationConfigChange: ApplicationStore,
    },
  },

  getDefaultProps() {
    return { appIds: [] };
  },

  getInitialState() {
    const { timeRange } = this.context.location.query;
    const timeRangeFromStore = this.getStore(VerificationOverviewStore).getTimeRange();

    return {
      countriesData: [],
      types: [],
      osTypes: [],
      timeRange: timeRange || timeRangeFromStore || DEFAULT_TIME_RANGE,
      xAxis: {},
      yAxis: [{}],
      sXAxis: {},
      sYAxis: [{
        unit: '%',
        alignment: 'right',
        max: 100,
      }],
      lines: null,
      successRateSeries: null,
      busiestAttempts: 0,
      busiestTime: null,
      attemptsError: null,
      pastAttemptsError: null,
      countriesError: null,
      typeError: null,
      osError: null,
      accumulatedAttempts: null,
    };
  },

  componentDidMount() {
    this.autoSelectAppId();
    this.resetCharts(this.state.timeRange);
  },

  componentDidUpdate(prevProps, prevState) {
    if (!this.state.appId) return;

    if (this.state.timeRange !== prevState.timeRange || this.state.appId !== prevState.appId) {
      this.resetCharts(this.state.timeRange);
      this.updateCharts(this.state.timeRange);
    }
  },

  onVerificationOverviewChange() {
    const { formatMessage } = this.props.intl;

    const summaryAttempts = this.getStore(VerificationOverviewStore).getSummaryAttempts();
    const countryAttempts = this.getStore(VerificationOverviewStore).getCountryAttempts();
    const osAttempts = this.getStore(VerificationOverviewStore).getOsAttempts();
    const methodAttempts = this.getStore(VerificationOverviewStore).getMethodAttempts();
    const successFailAttempts = this.getStore(VerificationOverviewStore).getSuccessFailAttempts();

    const overviewData = merge(summaryAttempts, countryAttempts, osAttempts, methodAttempts);
    this.setState(overviewData);

    // Avoid multiple execution of this function that makes the line chart have dirty preoccupied data
    if ((successFailAttempts.totalAttempts || []).length) {
      this.setState(successFailAttempts);
      this.toggleAttemptType(this.state.attemptToggle || TOTAL_NUMBER_ATTEMPTS);
    }

    // Inject custom world data provided by Highmaps
    Highcharts.maps['custom/world'] = MAP_DATA;

    // Copy source data to be a new one for Highmap to avoid the behavior of changing source data
    const maxValue = max(countryAttempts.countriesData, country => country.value).value;
    const mapConfig = getMapConfig(
      'verificationCountrySection',
      (countryAttempts.countriesData || []).slice(0),
      maxValue,
      formatMessage(MESSAGES.numberOfVerificationAttempts)
    );
    new Highcharts.Map(mapConfig);
  },

  onAppIdChange(appId) {
    this.setState({ appId });
  },

  onApplicationConfigChange() {
    this.autoSelectAppId();
  },

  renderAttemptToggles() {
    const { intl: { formatMessage } } = this.props;

    const ATTEMPT_TOGGLES = [
      {
        id: TOTAL_NUMBER_ATTEMPTS,
        title: MESSAGES.totalNumbersOfVerificationAttempts,
        color: 'red',
      },
      {
        id: SUCCESS_ATTEMPTS_NUMBER,
        title: MESSAGES.successVerificationAttempts,
        color: 'green',
      },
      {
        id: SUCCESS_ATTEMPTS_RATE,
        title: MESSAGES.successVerificationRate,
        color: 'blue',
      },
    ];

    return ATTEMPT_TOGGLES.map(toggle => (
      <div key={toggle.id} className="verification-overview__title">
        <ColorRadioButton
          group="verificationAttempt"
          label={formatMessage(toggle.title)}
          value={toggle.id}
          color={toggle.color}
          checked={this.state.attemptToggle === toggle.id}
          onChange={this.toggleAttemptType}
          location="right"
        />
      </div>
    ));
  },

  renderAttemptInfo() {
    return (
      <div>
        <div className="large-4 columns verification-overview__attempt__information">
          <div className="verification-overview__title">
            <FormattedMessage
              id="overview.busiestTime"
              defaultMessage="Busiest Time"
            />
            <span>:</span>
          </div>
          <div className="verification-overview__value">
            {this.isLoading() ? EMPTY_CELL_PLACEHOLDER : this.state.busiestAttempts}
          </div>
          <div className="verification-overview__title">
            {this.renderAttemptSection()}
          </div>
        </div>

        <div className="large-6 columns verification-overview__attempt__datetime">
          <If condition={this.state.busiestTime}>
            <div>
              <div>{dateLocale.format(moment(this.state.busiestTime), 'DD MMM YYYY')}</div>
              <div>{dateLocale.format(moment(this.state.busiestTime), 'h:mma')}</div>
            </div>
          <Else />
            <FormattedMessage
              id="unknownLabel"
              defaultMessage="N/A"
            />
          </If>
        </div>

        <div className="large-14 columns verification-overview__attempt__toggle">
          {this.renderAttemptToggles()}
        </div>
      </div>
    );
  },

  renderAttemptSection() {
    return <FormattedMessage id="attempts" defaultMessage="Attempts" />;
  },

  renderCountryTable() {
    const sortedCountries = sortByOrder(this.state.countriesData, ['value'], ['desc'], values);

    return (
      <table className="verification-overview__country__table">
        <tr>
          <th>
            <FormattedMessage id="location" defaultMessage="Location" />
          </th>
          <th>
            {this.renderAttemptSection()}
          </th>
        </tr>
        {
          (sortedCountries.slice(0, 10) || []).map((country) => {
            return (<tr key={country.code}><td>{country.name || EMPTY_CELL_PLACEHOLDER}</td><td>{country.value || EMPTY_CELL_PLACEHOLDER}</td></tr>);
          })
        }
      </table>
    );
  },

  render() {
    const { intl: { formatMessage } } = this.props;
    const { role, identity } = this.context.params;
    const options = [];

    this.props.appIds.forEach(item => {
      options.push({ value: item, label: item });
    });

    const methodStats = this.state.types.map(type => ({
      name: this.getMethodHeaderByMethodType(type.name),
      value: type.value,
    }));

    return (
      <div className="row">
        <FilterBar.Wrapper>
          <FilterBarNavigation section="verification-sdk" tab="overview" />
          <FilterBar.LeftItems>
            {/* Need not to provide selection when there is only one single selected options to avoid confusion */}
            <If condition={options.length > 1}>
              <Select
                name="appid"
                className="verification-details__app-select"
                options={options}
                value={`Application ID: ${(this.state.appId ? this.state.appId : '-')}`}
                clearable={false}
                searchable={false}
                onChange={this.onAppIdChange}
              />
            </If>

          </FilterBar.LeftItems>
          <FilterBar.RightItems>
            <div className="inline-with-space">
              <div className={classNames('tiny-spinner', 'revert', { active: this.isLoading() })}></div>
              <TimeFramePicker
                className={classNames('revert', { disabled: this.isLoading() })}
                frames={TIME_FRAMES}
                currentFrame={this.state.timeRange}
                onChange={this.handleTimeFrameChange}
              />
            </div>
          </FilterBar.RightItems>
        </FilterBar.Wrapper>

        <div className="verification-overview row">
          <div className="large-16 columns">
            <Panel.Wrapper>
              <div className="header narrow">
                <h5 className="title">
                  <FormattedMessage id="summary" defaultMessage="Summary" />
                </h5>
              </div>
              <div
                className={classNames('body', 'verification-overview__summary', { error: this.state.attemptsError || this.state.pastAttemptsError })}
              >
                <SummaryCells
                  isLoading={this.isLoading()}
                  accumulatedAttempts={this.state.accumulatedAttempts}
                  accumulatedFailure={this.state.accumulatedFailure}
                  accumulatedSuccess={this.state.accumulatedSuccess}
                  averageSuccessRate={this.state.averageSuccessRate}
                  pastAccumulatedAttempts={this.state.pastAccumulatedAttempts}
                  pastAccumulatedSuccess={this.state.pastAccumulatedSuccess}
                  pastAccumulatedFailure={this.state.pastAccumulatedFailure}
                  pastAverageSuccessRate={this.state.pastAverageSuccessRate}
                />
              </div>
            </Panel.Wrapper>

            <Panel.Wrapper>
              <div className="header narrow">
                <h5 className="title">
                  <FormattedMessage
                    id="vsdk.verificationAttempt"
                    defaultMessage="Verification Attempt"
                  />
                </h5>
              </div>
              <div className={classNames('body', 'verification-overview__attempt', { error: this.state.attemptsError })}>
                {this.renderAttemptInfo()}
                <div className="large-24 columns verification-overview__attempt__chart">
                  <LineChart
                    className={classNames('attempt-line', { hide: this.state.showSuccessRate })}
                    lines={this.state.lines}
                    xAxis={this.state.xAxis}
                    yAxis={this.state.yAxis}
                    selectedLine={this.state.selectedLineInChartA}
                  />
                  <LineChart
                    className={classNames('success-line', { hide: !this.state.showSuccessRate })}
                    lines={this.state.successRateSeries}
                    xAxis={this.state.sXAxis}
                    yAxis={this.state.sYAxis}
                    selectedLine={SUCCESS_ATTEMPTS_RATE}
                  />
                </div>
              </div>
            </Panel.Wrapper>

            <Panel.Wrapper>
              <div className="header narrow">
                <h5 className="title">
                  <FormattedMessage
                    id="vsdk.overview.top.attempts"
                    defaultMessage="Top 10 numbers of verification attempts in the world"
                  />
                </h5>
              </div>
              <div className={classNames('body', 'verification-overview__country', { error: this.state.countriesError })}>
                <div className="large-10 columns">
                  {this.renderCountryTable()}
                </div>

                <div className="large-14 columns">
                  <div id="verificationCountrySection">
                    <FormattedMessage
                      id="loadingMap"
                      defaultMessage="Loading map"
                    />
                    <span>...</span>
                  </div>
                </div>
              </div>
            </Panel.Wrapper>
          </div>

          <div className="large-8 columns">
            <Panel.Wrapper>
              <div className="header narrow">
                <h5 className="title">
                  <FormattedMessage
                    id="vsdk.details.method"
                    defaultMessage="Verification by method"
                  />
                </h5>
              </div>
              <div className={classNames('verification-overview__method', { error: this.state.typeError })}>
                <Panel.Body>
                  <DonutChartPanel
                    className="method-donut"
                    data={methodStats}
                    size={150}
                    bars={4}
                    unit={formatMessage(i18nMessages.attempts)}
                  />
                </Panel.Body>
              </div>
            </Panel.Wrapper>

            <Panel.Wrapper>
              <div className="header narrow">
                <h5 className="title">
                  <FormattedMessage
                    id="vsdk.details.osType"
                    defaultMessage="Verification OS type"
                  />
                </h5>
              </div>
              <div className={classNames('verification-overview__os', { error: this.state.osError })}>
                <Panel.Body>
                  <DonutChartPanel
                    className="os-donut"
                    data={this.state.osTypes}
                    size={150}
                    bars={2}
                    unit={formatMessage(i18nMessages.attempts)}
                  />
                </Panel.Body>
              </div>
            </Panel.Wrapper>
          </div>
        </div>
      </div>
    );
  },

  resetCharts(timeRange) {
    const { from, quantity, timescale } = parseTimeRange(timeRange);

    const xAxis = {
      start: from,
      tickCount: parseInt(quantity, 10),
      tickInterval: (timescale === 'day' ? 24 : 1) * 3600 * 1000,
    };

    this.setState({
      xAxis,
      sXAxis: xAxis,
      lines: null,
      successRateSeries: null,
    });
  },

  updateCharts(timeRange) {
    const { identity } = this.context.params;
    const { quantity, timescale } = parseTimeRange(timeRange);

    this.context.executeAction(fetchVerificationOverview, {
      quantity,
      timescale,
      application: this.state.appId,
      carrierId: identity,
    });
  },

  autoSelectAppId() {
    this.setState({ appId: this.context.getStore(ApplicationStore).getDefaultAppId() });
  },

  setTotalAttempts() {
    this.setState({
      attemptToggle: TOTAL_NUMBER_ATTEMPTS,
      selectedLineInChartA: TOTAL_NUMBER_ATTEMPTS,
      busiestAttempts: max(this.state.totalAttempts),
      busiestTime: this.state.totalAttempts ? fromTimeslot(this.state.totalAttempts, moment(), this.state.timeRange) : null,
      showSuccessRate: false,
    });

    this.setAttemptsLines();
  },

  setSuccessAttempts() {
    this.setState({
      attemptToggle: SUCCESS_ATTEMPTS_NUMBER,
      selectedLineInChartA: SUCCESS_ATTEMPTS_NUMBER,
      busiestAttempts: max(this.state.successAttempts),
      busiestTime: this.state.successAttempts ? fromTimeslot(this.state.successAttempts, moment(), this.state.timeRange) : null,
      showSuccessRate: false,
    });

    this.setAttemptsLines();
  },

  setSuccessRates() {
    const { formatMessage } = this.props.intl;

    this.setState({
      attemptToggle: SUCCESS_ATTEMPTS_RATE,
      busiestAttempts: max(this.state.successAttempts),
      busiestTime: this.state.successAttempts ? fromTimeslot(this.state.successAttempts, moment(), this.state.timeRange) : null,
      successRateSeries: [
        {
          name: SUCCESS_ATTEMPTS_RATE,
          data: this.state.successRates,
          color: '#4E92DF',
          selected: true,
          tooltipFormatter: (x, y, xIndex) => {
            return `
              <div style="text-align: center">
                <div>${dateLocale.format(moment(x).local(), TOOLTIP_TIME_FORMAT)}</div>
                <div>${this.state.successAttempts[xIndex]}/${this.state.totalAttempts[xIndex]} ${formatMessage(MESSAGES.successVerificationUnit)}</div>
                <div>${formatMessage(MESSAGES.successVerificationRate)}: ${normalizeDurationInMS(y)}%</div>
              </div>
            `;
          },
        },
      ],
      showSuccessRate: true,
    });
  },

  setAttemptsLines() {
    const { formatMessage } = this.props.intl;

    this.setState({
      lines: [
        {
          name: TOTAL_NUMBER_ATTEMPTS,
          data: this.state.totalAttempts,
          color: '#FB3940',
          tooltipFormatter: (x, y) => {
            return `
              <div style="text-align: center">
                <div>${dateLocale.format(moment(x).local(), TOOLTIP_TIME_FORMAT)}</div>
                <div>${formatMessage(MESSAGES.totalNumbersOfVerificationAttempts)}: ${y}</div>
              </div>
            `;
          },
        },
        {
          name: SUCCESS_ATTEMPTS_NUMBER,
          data: this.state.successAttempts,
          color: '#21C031',
          tooltipFormatter: (x, y) => {
            return `
              <div style="text-align: center">
                <div>${dateLocale.format(moment(x).local(), TOOLTIP_TIME_FORMAT)}</div>
                <div>${formatMessage(MESSAGES.successVerificationAttempts)}: ${y}</div>
              </div>
            `;
          },
        },
      ],
    });
  },

  toggleAttemptType(attemptType) {
    const toggle = {
      [TOTAL_NUMBER_ATTEMPTS]: this.setTotalAttempts,
      [SUCCESS_ATTEMPTS_NUMBER]: this.setSuccessAttempts,
      [SUCCESS_ATTEMPTS_RATE]: this.setSuccessRates,
    };

    return toggle[attemptType]();
  },

  handleTimeFrameChange(timeRange) {
    const { timeRange: currentTimeRange } = this.state;

    // if selected timeRange is the same, change should not be applied
    if (timeRange === currentTimeRange) {
      return;
    }

    this.context.router.push({
      pathname: this.context.location.pathname,
      query: { timeRange },
    });


    /* Store timeRange to store so that we can set it back into query back switch pages */
    this.executeAction(resetVerificationData);
    this.executeAction(changeTimeRange, timeRange);

    this.setState({ timeRange });
  },

  isLoading() {
    const {
      attemptsError,
      pastAttemptsError,
      countriesError,
      typeError,
      osError,
    } = this.state;

    const pendingFetched = isNull(this.state.accumulatedAttempts);

    const hasError = some([
      attemptsError,
      pastAttemptsError,
      countriesError,
      typeError,
      osError,
    ], errorObj => !isNull(errorObj));

    return pendingFetched && !hasError;
  },

  getMethodHeaderByMethodType(type) {
    const { formatMessage } = this.props.intl;

    switch (type) {
      case 'Call-in':
        return formatMessage(METHOD_MESSAGES.callIn);

      case 'Call-out':
        return formatMessage(METHOD_MESSAGES.callOut);

      case 'SMS':
        return formatMessage(METHOD_MESSAGES.sms);

      case 'IVR':
        return formatMessage(METHOD_MESSAGES.ivr);

      default:
        return type;
    }
  },
});

export default injectIntl(VerificationOverview);
