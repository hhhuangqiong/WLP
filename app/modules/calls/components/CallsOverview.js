import { bindKey, get, reduce, isEmpty, isUndefined } from 'lodash';
import moment from 'moment';
import classNames from 'classnames';

import React from 'react';
import {Link} from 'react-router';
import Select from 'react-select';

import FluxibleMixin from 'fluxible/addons/FluxibleMixin';
import AuthMixin from '../../../utils/AuthMixin';

import * as FilterBar from '../../../main/components/FilterBar';
import * as Panel from './../../../main/components/Panel';
import * as DataGrid from '../../../main/statistics/components/DataGrid';
import TimeFramePicker, { parseTimeRange } from '../../../main/components/TimeFramePicker';
import ColorRadioButton from '../../../main/components/ColorRadioButton';
import LineChart from '../../../main/components/LineChart';
import DateSelector from '../../../main/components/DateSelector';
import CombinationChart from '../../../main/components/CombinationChart';

import CallsOverviewStore from '../stores/CallsOverviewStore';
import ApplicationStore from '../../../main/stores/ApplicationStore';

import fetchCallsStatsMonthly from '../actions/fetchCallsStatsMonthly';
import fetchCallsStatsTotal from '../actions/fetchCallsStatsTotal';
import clearCallsStats from '../actions/clearCallsStats';

const LAST_UPDATE_TIME_FORMAT = 'MMM DD, YYYY H:mm';
const defaultQueryMonth = moment().subtract(1, 'month');

const STATS_TYPE = {
  TOTAL_ATTEMPT: 'Total Calls Attempt',
  SUCCESSFUL_ATTEMPT: 'Total Success Calls',
  SUCCESSFUL_RATE: 'ASR (%)',
  TOTAL_DURATION: 'Total Call Duration',
  AVERAGE_DURATION: 'Average Call Duration'
};

const CALL_TYPE = {
  ALL: '',
  ONNET: 'ONNET',
  OFFNET: 'OFFNET'
};

const YEARS_BACKWARD = 5;
const TIME_FRAMES = ['24 hours', '7 days'];
const TOOLTIP_TIME_FORMAT = {
  hour: 'HH:00, DD MMM',
  day: 'DD MMM'
};
const ATTEMPT_LINECHART_TOGGLES = [
  {
    id: STATS_TYPE.TOTAL_ATTEMPT,
    title: 'Total Calls Attempt',
    color: 'red'
  },
  {
    id: STATS_TYPE.SUCCESSFUL_ATTEMPT,
    title: 'Total Successful Calls',
    color: 'green'
  }
];
const DURATION_LINECHART_TOGGLES = [
  {
    id: STATS_TYPE.TOTAL_DURATION,
    title: 'Total Call Duration (minute)',
    color: 'red'
  },
  {
    id: STATS_TYPE.AVERAGE_DURATION,
    title: 'Average Call Duration (second)',
    color: 'green'
  }
];

var CallsOverview = React.createClass({
  contextTypes: {
    router: React.PropTypes.func.isRequired
  },

  mixins: [FluxibleMixin, AuthMixin],

  statics: {
    storeListeners: {
      onCallsStatsChange: CallsOverviewStore
    }
  },

  onCallsStatsChange() {
    let states = this.context.getStore(CallsOverviewStore).getState();
    this.setState(states);
  },

  getInitialState() {
    return {
      appIds: this.getStore(ApplicationStore).getAppIds() || [],
      appId: this.getStore(ApplicationStore).getDefaultAppId(),
      type: CALL_TYPE.ALL,
      selectedMonth: defaultQueryMonth.get('month'),
      selectedYear: defaultQueryMonth.get('year'),
      selectedLastXDays: TIME_FRAMES[0],
      selectedAttemptLine: STATS_TYPE.TOTAL_ATTEMPT,
      selectedDurationLine: STATS_TYPE.TOTAL_DURATION,
    };
  },

  componentDidMount() {
    this._getMonthlyStats(CALL_TYPE.ALL, defaultQueryMonth.get('month'), defaultQueryMonth.get('year'));
    this._getLastXDaysStats(CALL_TYPE.ALL, TIME_FRAMES[0]);
  },

  componentWillUnmount() {
    // I am unsure about this in long term
    // but this is essential for now to make the
    // highcharts work properly.
    this.context.executeAction(clearCallsStats);
  },

  changeCallType(type) {
    // THIS IS A HACK FOR LINECHART
    // the lines key has to be cleared (e.g. set to null)
    // in order to reset the LineChart
    this.setState({
      totalAttemptStats: null, successfulAttemptStats: null,
      totalDurationStats: null, averageDurationStats: null
    });

    this.setState({ type });
    this._getMonthlyStats(type);
    this._getLastXDaysStats(type);
  },

  monthlyStatsYearChange(year) {
    this.setState({ selectedYear: year });
    this._getMonthlyStats(this.state.type, null, year);
  },

  timeFrameChange(time) {
    // THIS IS A HACK FOR LINECHART
    // the lines key has to be cleared (e.g. set to null)
    // in order to reset the LineChart
    this.setState({
      totalAttemptStats: null, successfulAttemptStats: null,
      totalDurationStats: null, averageDurationStats: null
    });

    this.setState({ selectedLastXDays: time });
    this._getLastXDaysStats(this.state.type, time);
  },

  toggleAttemptType(type) {
    this.setState({ selectedAttemptLine: type });
  },

  toggleDurationType(type) {
    this.setState({ selectedDurationLine: type })
  },

  _getLineChartXAxis() {
    let { from, quantity, timescale } = parseTimeRange(this.state.selectedLastXDays);

    return {
      start: from,
      tickCount: parseInt(quantity),
      tickInterval: (timescale === 'day' ? 24 : 1) * 3600 * 1000
    };
  },

  _getAttemptLineChartData() {
    let { timescale } = parseTimeRange(this.state.selectedLastXDays);

    let totalAttemptData = reduce(this.state.totalAttemptStats, (result, stat) => { result.push(Math.round(stat.v)); return result; }, []);
    let successAttemptData = reduce(this.state.successAttemptStats, (result, stat) => { result.push(Math.round(stat.v)); return result; }, []);
    let successRateData = reduce(this.state.successRateStats, (result, stat) => { result.push(stat.v); return result; }, []);

    let totalAttemptTooltipFormatter = (x, y, index) => {
      let totalCallAttempt =  totalAttemptData[index];
      let totalSuccessCall =  successAttemptData[index];
      let averageSuccessRate =  successRateData[index];

      return `
              <div class="text-left">
                <div>${moment(x).local().format(get(TOOLTIP_TIME_FORMAT, `${timescale}`))}</div>
                <div>Total Call Attempt: ${totalCallAttempt}</div>
                <div>Total Success Call: ${totalSuccessCall}</div>
                <div>ASR (%): ${Math.round(averageSuccessRate)}%</div>
              </div>
            `;
    };

    return !isEmpty(this.state.totalAttemptStats) && !isEmpty(this.state.successAttemptStats) && !isEmpty(this.state.successRateStats) ? [
      {
        name: STATS_TYPE.SUCCESSFUL_RATE,
        legendName: 'ASR (%)',
        legendIndex: 2,
        type: 'line',
        data: successRateData,
        color: '#4C91DE',
        tooltipFormatter: totalAttemptTooltipFormatter,
        yAxis: 1,
        zIndex: 9,
        symbol: 'circle',
        lineWidth: 2
      },
      {
        name: STATS_TYPE.TOTAL_ATTEMPT,
        legendName: 'Total Calls Attempt',
        legendIndex: 0,
        type: 'column',
        data: totalAttemptData,
        color: '#D8D8D8',
        yAxis: 0
      },
      {
        name: STATS_TYPE.SUCCESSFUL_ATTEMPT,
        legendName: 'Total Success Calls',
        legendIndex: 1,
        type: 'column',
        data: successAttemptData,
        color: '#81D135',
        yAxis: 0
      }
    ] : null;
  },

  _getDurationLineChartData() {
    let { timescale } = parseTimeRange(this.state.selectedLastXDays);
    let totalDurationData = reduce(this.state.totalDurationStats, (result, stat) => { result.push(Math.round(stat.v / 1000 / 60)); return result; }, []);
    let averageDurationData = reduce(this.state.averageDurationStats, (result, stat) => { result.push(Math.round(stat.v) / 1000); return result; }, []);
    let successAttemptData = reduce(this.state.successAttemptStats, (result, stat) => { result.push(Math.round(stat.v)); return result; }, []);

    let averageDurationTooltipFormatter = (x, y, index) => {
      let totalDuration =  totalDurationData[index];
      let averageDuration =  averageDurationData[index];
      let successAttempt =  successAttemptData[index];

      return `
              <div class="text-left">
                <div>${moment(x).local().format(get(TOOLTIP_TIME_FORMAT, `${timescale}`))}</div>
                <div>Total Call Attempt: ${totalDuration}</div>
                <div>Total Success Call: ${averageDuration}</div>
                <div>ASR (%): ${Math.round(successAttempt)}%</div>
              </div>
            `;
    };

    return !isEmpty(this.state.totalDurationStats) && !isEmpty(this.state.averageDurationStats) && !isEmpty(this.state.averageDurationStats) ? [
      {
        name: STATS_TYPE.AVERAGE_DURATION,
        legendIndex: 2,
        type: 'line',
        data: averageDurationData,
        color: '#4C91DE',
        tooltipFormatter: averageDurationTooltipFormatter,
        yAxis: 0,
        zIndex: 9,
        symbol: 'circle',
        lineWidth: 2
      },
      {
        name: STATS_TYPE.TOTAL_DURATION,
        legendIndex: 0,
        type: 'column',
        data: totalDurationData,
        color: '#D8D8D8',
        yAxis: 1
      },
      {
        name: STATS_TYPE.SUCCESSFUL_ATTEMPT,
        legendName: 'Total Success Calls',
        legendIndex: 1,
        type: 'column',
        data: successAttemptData,
        color: '#81D135',
        yAxis: 2
      }
    ] : null;
  },

  _getAttemptLineChartSelectedLine() {
    return this.state.selectedAttemptLine;
  },

  _getDurationLineChartSelectedLine() {
    return this.state.selectedDurationLine;
  },

  _getAppIdSelectOptions() {
    return reduce(this.state.appIds, (result, id) => {
      var option = { value: id, label: id };
      result.push(option);
      return result;
    }, [])
  },

  _getMonths() {
    let monthArray = Array.apply(0, Array(12)).map((_, i ) => { return i });

    return reduce(monthArray, (result, n) => {
      var option = { value: n, label: moment().month(n).format('MMMM') };
      result.push(option);
      return result;
    }, []);
  },

  _getYears() {
    let years = [];

    for (let i = 0; i < YEARS_BACKWARD; i++) {
      years.push({
        value: (i > 0) ? moment().subtract(i, 'years').format('YYYY') : moment().format('YYYY'),
        label: (i > 0) ? moment().subtract(i, 'years').format('YYYY') : moment().format('YYYY')
      });
    }

    return years;
  },

  _getMonthlyStats(type, month, year) {
    let { identity } = this.context.router.getCurrentParams();

    let selectedMonth = (month || month === 0) ? month : this.state.selectedMonth;
    let selectedYear = year || this.state.selectedYear;

    let queryTime = moment().month(selectedMonth).year(selectedYear);

    this.context.executeAction(fetchCallsStatsMonthly, {
      fromTime: queryTime.startOf('month').format('x'),
      toTime: queryTime.endOf('month').format('x'),
      carrierId: identity,
      type: !isUndefined(type) ? type : this.state.type
    });
  },

  _getMonthlyUser() {
    let { thisMonthUser, lastMonthUser  } = this.state;
    let userChange = thisMonthUser - lastMonthUser;

    return {
      total: thisMonthUser,
      change: userChange,
      percent: userChange && lastMonthUser ? Math.round((userChange / lastMonthUser) * 100) : '-',
      direction: (userChange > 0) ? 'up' : 'down'
    };
  },

  _getLastXDaysStats(type, lastXDays) {
    let { identity } = this.context.router.getCurrentParams();
    let timeRange = lastXDays || this.state.selectedLastXDays;

    let { from, to, quantity: selectedLastXDays, timescale } = parseTimeRange(timeRange);

    this.context.executeAction(fetchCallsStatsTotal, {
      fromTime: from,
      toTime: to,
      carrierId: identity,
      timescale,
      type: !isUndefined(type) ? type : this.state.type
    });
  },

  _getTotalCallAttempt() {
    let totalCall = reduce(this.state.totalAttemptStats, (total, stat) => {
      total += stat.v;
      return total;
    }, 0);

    return totalCall;
  },

  _getSuccessfulAttempt() {
    let totalSuccess = reduce(this.state.successAttemptStats, (success, stat) => {
      success += stat.v;
      return success
    }, 0);

    return totalSuccess;
  },

  _getAverageSuccessfulRate() {
    let totalAttempt = this._getTotalCallAttempt();
    let totalSuccess = this._getSuccessfulAttempt();

    return (totalSuccess / totalAttempt) * 100;
  },

  _getTotalCallDuration() {
    let totalDurationInMs =  reduce(this.state.totalDurationStats, (total, stat) => {
      total += stat.v;
      return total;
    }, 0);

    return totalDurationInMs / 1000 / 60;
  },

  /**
   * @method _getAverageCallDuration
   * @description to calculate the average call duration. The divisor is
   * total number of call attempt but not that of successful attempt. The
   * result will be in seconds
   *
   **/
  _getAverageCallDuration() {
    let totalAttempt = this._getTotalCallAttempt();
    let totalDuration = this._getTotalCallDuration();

    return (totalDuration/totalAttempt) * 60;
  },

  _getLastUpdate(date) {
    const lastUpdate = moment(date).endOf('month').format(LAST_UPDATE_TIME_FORMAT);
    return `Data updated till: ${lastUpdate}`;
  },

  _getLastUpdateFromTimeFrame() {
    let timeframe = this.state.selectedLastXDays;
    const { timescale } = parseTimeRange(timeframe);
    let lastUpdate = moment().endOf(timescale).format(LAST_UPDATE_TIME_FORMAT);
    return `Data updated till: ${lastUpdate}`;
  },

  getMonthlyStatsDate() {
    return moment({
      month: this.state.selectedMonth,
      year: this.state.selectedYear,
    }).format('L');
  },

  handleMonthlyStatsChange(date) {
    const momentDate = moment(date, 'L');
    const selectedMonth = momentDate.month();
    const selectedYear = momentDate.year();
    this.setState({ selectedMonth, selectedYear });
    this._getMonthlyStats(this.state.type, selectedMonth, selectedYear);
  },

  render() {
    const { role, identity } = this.context.router.getCurrentParams();
    const monthlyUserStats = this._getMonthlyUser();
    const appIds = this._getAppIdSelectOptions();

    return (
      <div className="row">
        <FilterBar.Wrapper>
          <FilterBar.NavigationItems>
            <Link to="calls-overview" params={{ role, identity }}>Overview</Link>
            <Link to="calls-details" params={{ role, identity }}>Details Report</Link>
          </FilterBar.NavigationItems>
          <FilterBar.LeftItems>
            <a className={classNames({ active: this.state.type === CALL_TYPE.ALL })} onClick={ bindKey(this, 'changeCallType', CALL_TYPE.ALL) }>All</a>
            <a className={classNames({ active: this.state.type === CALL_TYPE.ONNET })} onClick={ bindKey(this, 'changeCallType', CALL_TYPE.ONNET) }>On-net</a>
            <a className={classNames({ active: this.state.type === CALL_TYPE.OFFNET })} onClick={ bindKey(this, 'changeCallType', CALL_TYPE.OFFNET) }>Off-net</a>
          </FilterBar.LeftItems>
          <FilterBar.RightItems>
            {/* Need not to provide selection when there is only one single selected options to avoid confusion */}
            <If condition={appIds.length > 1}>
              <Select
                name="appid"
                className="end-users-details__app-select"
                options={appIds}
                value={'Application ID: ' + (this.state.appId ? this.state.appId : '-')}
                clearable={false}
                searchable={false}
                onChange={this.onAppIdChange}
              />
            </If>
          </FilterBar.RightItems>
        </FilterBar.Wrapper>

        <div className="large-24 columns">
          <Panel.Wrapper>
            <Panel.Header
              customClass="narrow"
              title="Monthly Voice Call User"
              caption={this._getLastUpdate({ year: this.state.selectedYear, month: this.state.selectedMonth })} >
              <div className="input-group picker month right">
                <DateSelector
                  date={this.getMonthlyStatsDate()}
                  onChange={this.handleMonthlyStatsChange}
                  monthOptions={this._getMonths()}
                  yearOptions={this._getYears()} />
              </div>
            </Panel.Header>
            <Panel.Body customClass="narrow no-padding">
              <DataGrid.Wrapper>
                <DataGrid.Cell
                  title="Monthly Voice Call User"
                  data={monthlyUserStats.total}
                  changeDir={monthlyUserStats.direction}
                  changeAmount={monthlyUserStats.change}
                  changeEffect="positive"
                  changePercentage={monthlyUserStats.percent} />
              </DataGrid.Wrapper>
            </Panel.Body>
          </Panel.Wrapper>
        </div>

        <div className="large-24 columns">
          <Panel.Wrapper>
            <Panel.Header
              customClass="narrow"
              title="Statistics"
              caption={this._getLastUpdateFromTimeFrame()} >
              <div className="input-group right">
                <label className="left">Past:</label>
                <TimeFramePicker
                  frames={TIME_FRAMES}
                  customClass={['input', 'right']}
                  currentFrame={this.state.selectedLastXDays}
                  onChange={this.timeFrameChange} />
              </div>
            </Panel.Header>
            <Panel.Body customClass="narrow no-padding">
              <div className="inner-wrap">
                <div className="chart-cell large-24 columns">
                  <div className="chart-cell__header row">
                  </div>
                  <div className="chart-cell__chart row">
                    <DataGrid.Wrapper>
                      <DataGrid.Cell
                        title="Total Call Attempts"
                        data={this._getTotalCallAttempt()} />
                      <DataGrid.Cell
                        title="ASR (%)"
                        data={this._getAverageSuccessfulRate()}
                        decimalPlace={2}
                        unit="%" />
                      <DataGrid.Cell
                        title="Total Call Duration"
                        data={this._getTotalCallDuration()}
                        unit="minutes" />
                      <DataGrid.Cell
                        title="Average Call Duration"
                        data={this._getAverageCallDuration()}
                        decimalPlace={2}
                        unit="seconds" />
                    </DataGrid.Wrapper>
                  </div>
                </div>
              </div>
            </Panel.Body>
            <Panel.Body customClass="narrow no-padding">
              <div className="inner-wrap">
                <div className="chart-cell large-24 columns">
                  <div className="chart-cell__header row">
                    <div className="large-24 columns">
                      <div className="chart-cell__header__title">
                        Call Success Analytic - ASR (%)
                      </div>
                      <div className="chart-cell__header__subtitle">
                        Answer Seizure Ratio
                      </div>
                    </div>
                  </div>
                  <div className="line-chart chart-cell__chart row">
                    <CombinationChart
                      className="attempt-line"
                      lines={this._getAttemptLineChartData()}
                      showLegend={true}
                      alignTicks={false}
                      xAxis={this._getLineChartXAxis()}
                      yAxis={[
                        {
                          alignment: 'left',
                          visible: false
                        },
                        {
                          unit: '%',
                          alignment: 'left',
                        }
                      ]} />
                  </div>
                </div>
              </div>
            </Panel.Body>
            <Panel.Body customClass="narrow no-padding">
              <div className="inner-wrap">
                <div className="chart-cell large-24 columns">
                  <div className="chart-cell__header row">
                    <div className="large-24 columns">
                      <div className="chart-cell__header__title">
                        Call Duration Analytic - ACD
                      </div>
                      <div className="chart-cell__header__subtitle">
                        Average Call Duration
                      </div>
                    </div>
                  </div>
                  <div className="line-chart chart-cell__chart row">
                    <CombinationChart
                      className="attempt-line"
                      lines={this._getDurationLineChartData()}
                      alignTicks={false}
                      showLegend={true}
                      xAxis={this._getLineChartXAxis()}
                      yAxis={[
                        {
                          unit: 's',
                          alignment: 'left'
                        },
                        {
                          unit: 'm',
                          alignment: 'right',
                          visible: false
                        },
                        {
                          unit: '',
                          alignment: 'right',
                          visible: false
                        }
                      ]} />
                  </div>
                </div>
              </div>
            </Panel.Body>
          </Panel.Wrapper>
        </div>
      </div>
    );
  }
});

export default CallsOverview;
