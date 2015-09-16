import React from 'react';
import { Link } from 'react-router';
import Select from 'react-select';
import classNames from 'classnames';
import moment from 'moment';

import FluxibleMixin from 'fluxible/addons/FluxibleMixin';
import AuthMixin from '../../../utils/AuthMixin';

import * as FilterBar from './../../../main/components/FilterBar';
import * as Panel from './../../../main/components/Panel';
import getMapConfig from '../constants/mapOfAttempts';

import ColorRadioButton from '../../../main/components/ColorRadioButton';
import TimeFramePicker from '../../../main/components/TimeFramePicker';
import LineChart from '../../../main/components/LineChart';
import DonutChartPanel from '../../../main/components/DonutChartPanel';
import SummaryCells from './SummaryCells';
import fetchVerificationOverview from '../actions/fetchVerificationOverview';
import VerificationOverviewStore from '../stores/VerificationOverviewStore';
import MAP_DATA from '../constants/mapData.js';

const TIME_FRAMES = ['24 hours', '7 days', '30 days', '60 days', '90 days'];
const DEFAULT_TIME_RANGE = '30 days';
const TOTAL_NUMBER_ATTEMPTS = 'totalNumberAttempts';
const SUCCESS_ATTEMPTS_NUMBER = 'successAttemptsNumber';
const SUCCESS_ATTEMPTS_RATE = 'successAttemptsRate';
const EMPTY_CELL_PLACEHOLDER = '-';

export default React.createClass({
  displayName: 'VerificationOverview',

  contextTypes: {
    router: React.PropTypes.func.isRequired,
    executeAction: React.PropTypes.func.isRequired,
    cookie: React.PropTypes.func.isRequired
  },

  mixins: [FluxibleMixin, AuthMixin],

  statics: {
    storeListeners: [VerificationOverviewStore],

    fetchData: (context, params, done) => {
      context.executeAction(fetchVerificationOverview, {
        carrierId: params.identity,
        from: 1440831600000,
        to: 1442822400000
      });
    }
  },
        // timeRange: localStorage.verificationSdkFromTime || DEFAULT_TIME_RANGE

  getInitialState() {
    return {
      countriesData: [],
      types: [],
      osTypes: [],
      timeRange: localStorage.verificationSdkFromTime || DEFAULT_TIME_RANGE,
      xAxis: {},
      yAxis: {},
      sXAxis: {},
      sYAxis: {
        unit: '%',
        alignment: 'right',
        max: 100
      },
      lines: null,
      successRateSeries: null,
      busiestAttempts: 0,
      busiestTime: null
    };
  },

  onChange() {
    let overviewData = this.getStore(VerificationOverviewStore).getOverviewData();
    this.setState(overviewData);

    // Select total numebr of attempts as default
    // this.toggleAttemptType(TOTAL_NUMBER_ATTEMPTS);

    // Inject custom world data provided by Highmaps
    Highcharts.maps['custom/world'] = MAP_DATA;

    // Copy source data to be a new one for Highmap to avoid the behavior of changing source data
    let maxValue = _.max(overviewData.countriesData, (country) => country.value).value;
    new Highcharts.Map(getMapConfig('verificationCountrySection', (overviewData.countriesData || []).slice(0), maxValue));
  },

  componentDidMount() {
    let timeRangeParts = this.state.timeRange.split(' ');
    let timeValue = timeRangeParts[0];
    let timeFormat = timeRangeParts[1];

    let xAxis = {
      start: Date.UTC(2015, 7, 22),
      tickCount: parseInt(timeValue),
      tickInterval: 24*3600*1000
    };

    this.setState({ xAxis, sXAxis: xAxis });
  },

  toggleAttemptType(attemptType) {
    let totalBusiestAttempts = _.max(this.state.totalAttempts);
    let totalBusiestAttemptsIndex = this.state.totalAttempts.indexOf(totalBusiestAttempts);

    let successBusiestAttempts = _.max(this.state.successAttempts);
    let successBusiestAttemptsIndex = this.state.successAttempts.indexOf(successBusiestAttempts);

    if (attemptType === TOTAL_NUMBER_ATTEMPTS || attemptType === SUCCESS_ATTEMPTS_NUMBER) {
      if (attemptType === TOTAL_NUMBER_ATTEMPTS) {
        this.setState({
          selectedLineInChartA: TOTAL_NUMBER_ATTEMPTS,
          busiestAttempts: totalBusiestAttempts,
          busiestTime: totalBusiestAttemptsIndex
        });

      } else if (attemptType === SUCCESS_ATTEMPTS_NUMBER) {
        this.setState({
          selectedLineInChartA: SUCCESS_ATTEMPTS_NUMBER,
          busiestAttempts: successBusiestAttempts,
          busiestTime: successBusiestAttemptsIndex
        });
      }

      this.setState({
        lines: [
          {
            name: TOTAL_NUMBER_ATTEMPTS,
            data: this.state.totalAttempts,
            color: '#FB3940'
          },
          {
            name: SUCCESS_ATTEMPTS_NUMBER,
            data: this.state.successAttempts,
            color: '#21C031'
          }
        ]
      });
    } else {
      this.setState({
        busiestAttempts: successBusiestAttempts,
        busiestTime: successBusiestAttemptsIndex,
        successRateSeries: [
          {
            name: SUCCESS_ATTEMPTS_RATE,
            data: this.state.successRates,
            color: '#4E92DF',
            selected: true,
            tooltipFormatter: (x, y, xIndex) => {
              return `
                <div style="text-align: center">
                  <div>${moment(x).format('D MMM')}</div>
                  <div>${this.state.successAttempts[xIndex]}/${this.state.totalAttempts[xIndex]} success</div>
                  <div>Success Rate: ${y}%</div>
                </div>
              `;
            }
          }
        ]
      });
    }

    this.setState({
      attemptToggle: attemptType,
      showSuccessRate: !(attemptType === TOTAL_NUMBER_ATTEMPTS || attemptType === SUCCESS_ATTEMPTS_NUMBER)
    });
  },

  handleTimeFrameChange(time) {
    localStorage.verificationSdkFromTime = time;
    this.setState({ timeRange: time });
    this.executeAction(fetchVerificationOverview, { timeRange: time });
  },

  renderAttemptToggles() {
    const ATTEMPT_TOGGLES = [
      {
        id: TOTAL_NUMBER_ATTEMPTS,
        title: 'Totals numbers of verification attempts',
        color: 'red'
      },
      {
        id: SUCCESS_ATTEMPTS_NUMBER,
        title: 'Success verification attempts',
        color: 'green'
      },
      {
        id: SUCCESS_ATTEMPTS_RATE,
        title: 'Success verification rate',
        color: 'blue'
      }
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
          <div className="verification-overview__value">{this.state.busiestAttempts}</div>
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
    let sortedCountries = _.sortByOrder(this.state.countriesData, ['value'], ['desc'], _.values);

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

  render () {
    let options = [];

    this.props.appIds.forEach(item => {
      options.push({
        value: item,
        label: item
      });
    });

    return (
      <div className="row">
        <FilterBar.Wrapper>
          <FilterBar.NavigationItems>
            <Link to="verification" params={{role, identity}}>Overview</Link>
            <Link to="verification-details" params={{role, identity}}>Details Report</Link>
          </FilterBar.NavigationItems>
          <FilterBar.LeftItems>
            <Select
              name="appid"
              className="verification-details__app-select"
              options={options}
              value={"Application ID: " + (this.state.appId ? this.state.appId : "-")}
              clearable={false}
              searchable={false}
              onChange={this.onAppIdChange}
            />
          </FilterBar.LeftItems>
          <FilterBar.RightItems>
            <TimeFramePicker
              frames={TIME_FRAMES}
              currentFrame={this.state.timeRange}
              onChange={this.handleTimeFrameChange}
            />
          </FilterBar.RightItems>
        </FilterBar.Wrapper>

        <div className="verification-overview row">
          <div className="large-16 columns">
            <Panel.Wrapper>
              <div className="header narrow"><h5 className="title">Summary</h5></div>
              <div className="body verification-overview__summary">
                <SummaryCells
                  accumulatedAttempts={this.state.accumulatedAttempts}
                  accumulatedFailure={this.state.accumulatedFailure}
                  accumulatedSuccess={this.state.accumulatedSuccess}
                  averageSuccessRate={this.state.averageSuccessRate}
                  timeRange={this.state.timeRange}
                  toTime={this.state.fromTime}
                />
              </div>
            </Panel.Wrapper>

            <Panel.Wrapper>
              <div className="header narrow"><h5 className="title">Verification Attempt</h5></div>
              <div className="body verification-overview__attempt">
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
                    selectedLine={this.state.selectedLineInChartB}
                    />
                </div>
              </div>
            </Panel.Wrapper>

            <Panel.Wrapper>
              <div className="header narrow"><h5 className="title">Top 10 numbers of verification attempts in the world</h5></div>
              <div className="body verification-overview__country">
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
              <Panel.Body>
                <DonutChartPanel
                  className="method-donut"
                  data={this.state.types}
                  size={150}
                  bars={4}
                  unit='attempts'
                />
              </Panel.Body>
            </Panel.Wrapper>

            <Panel.Wrapper>
              <div className="header narrow"><h5 className="title">Verification OS type</h5></div>
              <Panel.Body>
                <DonutChartPanel
                  className="os-donut"
                  data={this.state.osTypes}
                  size={150}
                  bars={2}
                  unit='attempts'
                />
              </Panel.Body>
            </Panel.Wrapper>
          </div>
        </div>
      </div>
    );
  }
});