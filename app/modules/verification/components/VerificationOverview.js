import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import Select from 'react-select';
import classNames from 'classnames';
import moment from 'moment';
import { isNull, max, last, merge, sortByOrder, some, values } from 'lodash';

import { FluxibleMixin } from 'fluxible-addons-react';
import AuthMixin from '../../../utils/AuthMixin';

import * as FilterBar from './../../../main/components/FilterBar';
import * as Panel from './../../../main/components/Panel';
import getMapConfig from '../constants/mapOfAttempts';

import ColorRadioButton from '../../../main/components/ColorRadioButton';
import TimeFramePicker, { parseTimeRange } from '../../../main/components/TimeFramePicker';
import LineChart from '../../../main/components/LineChart';
import DonutChartPanel from '../../../main/components/DonutChartPanel';
import SummaryCells from './SummaryCells';
import fetchVerificationOverview from '../actions/fetchVerificationOverview';
import resetVerificationData from '../actions/resetVerificationData';
import VerificationOverviewStore from '../stores/VerificationOverviewStore';
import ApplicationStore from '../../../main/stores/ApplicationStore';
import { normalizeDurationInMS, timeFromNow } from '../../../utils/StringFormatter';
import MAP_DATA from '../constants/mapData.js';
import changeTimeRange from '../actions/changeTimeRange';

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

export default React.createClass({
  displayName: 'VerificationOverview',

  propTypes: {
    appIds: PropTypes.array,
  },

  contextTypes: {
    router: PropTypes.func.isRequired,
    executeAction: PropTypes.func.isRequired,
  },

  mixins: [FluxibleMixin, AuthMixin],

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
    const { timeRange } = this.context.router.getCurrentQuery();
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
    new Highcharts.Map(getMapConfig('verificationCountrySection', (countryAttempts.countriesData || []).slice(0), maxValue));
  },

  onAppIdChange(appId) {
    this.setState({ appId });
  },

  onApplicationConfigChange() {
    this.autoSelectAppId();
  },

  renderAttemptToggles() {
    const ATTEMPT_TOGGLES = [
      {
        id: TOTAL_NUMBER_ATTEMPTS,
        title: 'Totals numbers of verification attempts',
        color: 'red',
      },
      {
        id: SUCCESS_ATTEMPTS_NUMBER,
        title: 'Success verification attempts',
        color: 'green',
      },
      {
        id: SUCCESS_ATTEMPTS_RATE,
        title: 'Success verification rate',
        color: 'blue',
      },
    ];

    return ATTEMPT_TOGGLES.map((toggle) => {
      return (
        <div key={toggle.id} className="verification-overview__title">
          <ColorRadioButton
            group="verificationAttempt"
            label={toggle.title}
            value={toggle.id}
            color={toggle.color}
            checked={this.state.attemptToggle === toggle.id}
            onChange={this.toggleAttemptType}
            location="right"
          />
        </div>
      );
    });
  },

  renderAttemptInfo() {
    return (
      <div>
        <div className="large-4 columns verification-overview__attempt__information">
          <div className="verification-overview__title">Busiest Time:</div>
          <div className="verification-overview__value">
            {this.isLoading() ? EMPTY_CELL_PLACEHOLDER : this.state.busiestAttempts}
          </div>
          <div className="verification-overview__title">attempts</div>
        </div>

        <div className="large-6 columns verification-overview__attempt__datetime">
          <If condition={this.state.busiestTime}>
            <div>
              <div>{moment(this.state.busiestTime).format('DD MMM YYYY')}</div>
              <div>{moment(this.state.busiestTime).format('h:mma')}</div>
            </div>
          <Else />
            <div>N/A</div>
          </If>
        </div>

        <div className="large-14 columns verification-overview__attempt__toggle">
          {this.renderAttemptToggles()}
        </div>
      </div>
    );
  },

  renderCountryTable() {
    const sortedCountries = sortByOrder(this.state.countriesData, ['value'], ['desc'], values);

    return (
      <table className="verification-overview__country__table">
        <tr><th>Location</th><th>Attempts</th></tr>
        {
          (sortedCountries.slice(0, 10) || []).map((country) => {
            return (<tr key={country.code}><td>{country.name || EMPTY_CELL_PLACEHOLDER}</td><td>{country.value || EMPTY_CELL_PLACEHOLDER}</td></tr>);
          })
        }
      </table>
    );
  },

  render() {
    const { role, identity } = this.context.router.getCurrentParams();
    const options = [];

    this.props.appIds.forEach(item => {
      options.push({ value: item, label: item });
    });

    return (
      <div className="row">
        <FilterBar.Wrapper>
          <FilterBar.NavigationItems>
            <Link to="verification" params={{ role, identity }}>Overview</Link>
            <Link to="verification-details" params={{ role, identity }}>Details Report</Link>
          </FilterBar.NavigationItems>
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
              <div className="header narrow"><h5 className="title">Summary</h5></div>
              <div className={classNames('body', 'verification-overview__summary', { error: this.state.attemptsError || this.state.pastAttemptsError })}>
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
              <div className="header narrow"><h5 className="title">Verification Attempt</h5></div>
              <div className={classNames('body', 'verification-overview__attempt', { error: this.state.attemptsError })}>
                {this.renderAttemptInfo()}
                <div className="large-24 columns verification-overview__attempt__chart">
                  <LineChart
                    className={classNames('attempt-line', { hide: this.state.showSuccessRate })}
                    lines={this.state.lines}
                    xAxis={this.state.xAxis}
                    yAxis={this.state.yAxis}
                    selectedLine={this.state.selectedLineInChartA} />

                  <LineChart
                    className={classNames('success-line', { hide: !this.state.showSuccessRate })}
                    lines={this.state.successRateSeries}
                    xAxis={this.state.sXAxis}
                    yAxis={this.state.sYAxis}
                    selectedLine={SUCCESS_ATTEMPTS_RATE} />
                </div>
              </div>
            </Panel.Wrapper>

            <Panel.Wrapper>
              <div className="header narrow"><h5 className="title">Top 10 numbers of verification attempts in the world</h5></div>
              <div className={classNames('body', 'verification-overview__country', { error: this.state.countriesError })}>
                <div className="large-10 columns">
                  {this.renderCountryTable()}
                </div>

                <div className="large-14 columns">
                  <div id="verificationCountrySection">Loading maps...</div>
                </div>
              </div>
            </Panel.Wrapper>
          </div>

          <div className="large-8 columns">
            <Panel.Wrapper>
              <div className="header narrow"><h5 className="title">Verification by method</h5></div>
              <div className={classNames('verification-overview__method', { error: this.state.typeError })}>
                <Panel.Body>
                  <DonutChartPanel
                    className="method-donut"
                    data={this.state.types}
                    size={150}
                    bars={4}
                    unit="attempts"
                  />
                </Panel.Body>
              </div>
            </Panel.Wrapper>

            <Panel.Wrapper>
              <div className="header narrow"><h5 className="title">Verification OS type</h5></div>
              <div className={classNames('verification-overview__os', { error: this.state.osError })}>
                <Panel.Body>
                  <DonutChartPanel
                    className="os-donut"
                    data={this.state.osTypes}
                    size={150}
                    bars={2}
                    unit="attempts"
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
    const { identity } = this.context.router.getCurrentParams();
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
                <div>${moment(x).local().format(TOOLTIP_TIME_FORMAT)}</div>
                <div>${this.state.successAttempts[xIndex]}/${this.state.totalAttempts[xIndex]} success</div>
                <div>Success Rate: ${normalizeDurationInMS(y)}%</div>
              </div>
            `;
          },
        },
      ],
      showSuccessRate: true,
    });
  },

  setAttemptsLines() {
    this.setState({
      lines: [
        {
          name: TOTAL_NUMBER_ATTEMPTS,
          data: this.state.totalAttempts,
          color: '#FB3940',
          tooltipFormatter: (x, y) => {
            return `
              <div style="text-align: center">
                <div>${moment(x).local().format(TOOLTIP_TIME_FORMAT)}</div>
                <div>Total Attempts: ${y}</div>
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
                <div>${moment(x).local().format(TOOLTIP_TIME_FORMAT)}</div>
                <div>Success Attempts: ${y}</div>
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
    /* Add timeRange value to query */
    const routeName = last(this.context.router.getCurrentRoutes()).name;
    const params = this.context.router.getCurrentParams();

    this.context.router.transitionTo(routeName, params, { timeRange });

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
});
