import { isNull, bindKey, get, reduce, isEmpty, isUndefined, round, max } from 'lodash';
import moment from 'moment';
import classNames from 'classnames';

import React, { PropTypes } from 'react';
import Select from 'react-select';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';

import { FluxibleMixin } from 'fluxible-addons-react';

import LastUpdateTime, { TIME_TYPES } from '../../../main/statistics/components/LastUpdateTime';
import * as FilterBar from '../../../main/components/FilterBar';
import * as Panel from './../../../main/components/Panel';
import * as DataGrid from '../../../main/statistics/components/DataGrid';
import TimeFramePicker from '../../../main/components/TimeFramePicker';
import { parseTimeRange, SHORT_DATE_FORMAT } from '../../../utils/timeFormatter';
import DateSelector from '../../../main/components/DateSelector';
import CombinationChart from '../../../main/components/CombinationChart';
import i18nMessages from '../../../main/constants/i18nMessages';
import CallsOverviewStore from '../stores/CallsOverviewStore';
import ApplicationStore from '../../../main/stores/ApplicationStore';
import FilterBarNavigation from '../../../main/filter-bar/components/FilterBarNavigation';

import fetchCallsStatsMonthly from '../actions/fetchCallsStatsMonthly';
import fetchCallsStatsTotal from '../actions/fetchCallsStatsTotal';
import clearCallsStats from '../actions/clearCallsStats';

import { normalizeDurationInMS } from '../../../utils/StringFormatter';

const defaultQueryMonth = moment().subtract(1, 'month');

import CALL_TYPE from '../constants/callType';

const TIME_FRAMES = ['24 hours', '7 days', '30 days', '60 days', '90 days'];

// this should be application-wide variable
const DECIMAL_PLACE = 1;

const MESSAGES = defineMessages({
  monthlyVoiceCallUser: {
    id: 'calls.overview.monthlyVoiceCallUser',
    defaultMessage: 'Monthly Voice Call User (Unique)',
  },
  callBehaviourStatistics: {
    id: 'calls.overview.callBehaviourStatistics',
    defaultMessage: 'Call Behaviour Statistics',
  },
  totalCallsAttempts: {
    id: 'calls.overview.totalCallsAttempts',
    defaultMessage: 'Total Calls Attempts',
  },
  totalSuccessfulCalls: {
    id: 'calls.overview.totalSuccessfulCalls',
    defaultMessage: 'Total Successful Calls',
  },
  totalCallDuration: {
    id: 'calls.overview.totalCallDuration',
    defaultMessage: 'Total Call Duration',
  },
  averageCallDuration: {
    id: 'calls.overview.averageCallDuration',
    defaultMessage: 'Average Call Duration',
  },
  answerSeizureRatio: {
    id: 'calls.overview.answerSeizureRatio',
    defaultMessage: 'Answer Seizure Ratio',
  },
});

const STATS_TYPE = {
  TOTAL_ATTEMPT: MESSAGES.totalCallsAttempts,
  SUCCESSFUL_ATTEMPT: MESSAGES.totalSuccessfulCalls,
  ANSWER_SEIZURE_RATIO: MESSAGES.answerSeizureRatio,
  TOTAL_DURATION: MESSAGES.totalCallDuration,
  AVERAGE_DURATION: MESSAGES.averageCallDuration,
};

const CallsOverview = React.createClass({
  propTypes: {
    intl: PropTypes.object.isRequired,
  },

  contextTypes: {
    location: PropTypes.object,
    params: PropTypes.object,
    router: PropTypes.object,
  },

  mixins: [FluxibleMixin],

  statics: {
    storeListeners: {
      onCallsStatsChange: CallsOverviewStore,
    },
  },

  getInitialState() {
    return {
      appIds: this.getStore(ApplicationStore).getAppIds() || [],
      appId: this.getStore(ApplicationStore).getDefaultAppId(),
      type: CALL_TYPE.ALL,
      selectedMonth: defaultQueryMonth.get('month'),
      selectedYear: defaultQueryMonth.get('year'),
      selectedLastXDays: TIME_FRAMES[0],
      selectedAttemptLine: STATS_TYPE.TOTAL_ATTEMPT.id,
      selectedDurationLine: STATS_TYPE.TOTAL_DURATION.id,
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

  onCallsStatsChange() {
    const states = this.context.getStore(CallsOverviewStore).getState();
    this.setState(states);
  },

  changeCallType(type) {
    // THIS IS A HACK FOR LINECHART
    // the lines key has to be cleared (e.g. set to null)
    // in order to reset the LineChart
    this.context.executeAction(clearCallsStats);

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
      totalDurationStats: null, averageDurationStats: null,
    });

    this.setState({ selectedLastXDays: time });
    this._getLastXDaysStats(this.state.type, time);
  },

  toggleAttemptType(type) {
    this.setState({ selectedAttemptLine: type });
  },

  toggleDurationType(type) {
    this.setState({ selectedDurationLine: type });
  },

  _isAverageDurationInMinutes() {
    return get(max(this.state.averageDurationStats, stat => stat.v), 'v') > (60 * 1000);
  },

  _getLineChartXAxis() {
    const { from, quantity, timescale } = parseTimeRange(this.state.selectedLastXDays);

    return {
      start: from,
      tickCount: parseInt(quantity, 10),
      tickInterval: (timescale === 'day' ? 24 : 1) * 3600 * 1000,
      crosshair: {
        color: 'rgba(76,145,222,0.3)',
      },
    };
  },

  _getAttemptLineChartData() {
    const { intl: { formatMessage } } = this.props;

    const totalAttemptData = reduce(this.state.totalAttemptStats, (result, stat) => { result.push(round(stat.v, DECIMAL_PLACE)); return result; }, []);
    const successAttemptData = reduce(this.state.successAttemptStats, (result, stat) => { result.push(round(stat.v, DECIMAL_PLACE)); return result; }, []);
    const successRateData = reduce(this.state.successRateStats, (result, stat) => { result.push(round(stat.v, DECIMAL_PLACE)); return result; }, []);

    return !isEmpty(this.state.totalAttemptStats) && !isEmpty(this.state.successAttemptStats) && !isEmpty(this.state.successRateStats) ? [
      {
        name: `${formatMessage(STATS_TYPE.ANSWER_SEIZURE_RATIO)} (%)`,
        legendIndex: 2,
        type: 'line',
        data: successRateData,
        color: '#4C91DE',
        yAxis: 1,
        zIndex: 9,
        symbol: 'circle',
        lineWidth: 2,
        tooltip: {
          valueSuffix: ' %',
          // TODO: make it as a default props for CombinationChart as the value presentation will be shared
          pointFormatter: function pointFormatter() {
            const color = this.color;
            const seriesName = this.series.name;
            const value = normalizeDurationInMS(this.y);
            const unit = this.series.tooltipOptions.valueSuffix;
            return `<span style="color:${color}">\u25CF</span> ${seriesName}: <b>${value}${unit}</b><br/>`;
          },
        },
      },
      {
        name: formatMessage(STATS_TYPE.TOTAL_ATTEMPT),
        legendIndex: 0,
        type: 'column',
        data: totalAttemptData,
        color: '#D8D8D8',
        yAxis: 0,
      },
      {
        name: formatMessage(STATS_TYPE.SUCCESSFUL_ATTEMPT),
        legendIndex: 1,
        type: 'column',
        data: successAttemptData,
        color: '#81D135',
        yAxis: 0,
      },
    ] : null;
  },

  _getDurationLineChartData() {
    const { intl: { formatMessage } } = this.props;

    const totalDurationData = reduce(this.state.totalDurationStats, (result, stat) => {
      let value = stat.v / 1000 / 60;
      result.push(value);
      return result;
    }, []);
    const averageDurationData = reduce(this.state.averageDurationStats, (result, stat) => { result.push(round((stat.v / 1000), DECIMAL_PLACE)); return result; }, []);
    const successAttemptData = reduce(this.state.successAttemptStats, (result, stat) => { result.push(stat.v); return result; }, []);

    return !isEmpty(this.state.totalDurationStats) && !isEmpty(this.state.averageDurationStats) && !isEmpty(this.state.averageDurationStats) ? [
      {
        name: formatMessage(STATS_TYPE.AVERAGE_DURATION),
        legendIndex: 2,
        type: 'line',
        data: averageDurationData,
        color: '#4C91DE',
        yAxis: 0,
        zIndex: 9,
        symbol: 'circle',
        lineWidth: 2,
        tooltip: {
          valueSuffix: ' s',
        },
      },
      {
        name: formatMessage(STATS_TYPE.TOTAL_DURATION),
        legendIndex: 0,
        type: 'column',
        data: totalDurationData,
        color: '#D8D8D8',
        yAxis: 1,
        tooltip: {
          valueSuffix: ' mins',
          // TODO: make it as a default props for CombinationChart as the value presentation will be shared
          pointFormatter: function pointFormatter() {
            const color = this.color;
            const seriesName = this.series.name;
            const value = normalizeDurationInMS(this.y);
            const unit = this.series.tooltipOptions.valueSuffix;
            return `<span style="color:${color}">\u25CF</span> ${seriesName}: <b>${value}${unit}</b><br/>`;
          },
        },
      },
      {
        name: formatMessage(STATS_TYPE.SUCCESSFUL_ATTEMPT),
        legendIndex: 1,
        type: 'column',
        data: successAttemptData,
        color: '#81D135',
        yAxis: 2,
      },
    ] : null;
  },

  _getDurationLineChartYAxis() {
    return [
      {
        unit: 's',
        alignment: 'left',
        tickInterval: 60,
        labels: {
          // it don't have to be rounded
          // as allowDecimal could be configured from HighCharts
          formatter: function () { return `${this.value / 60}m`; }
        },
      },
      {
        unit: 'm',
        alignment: 'right',
        visible: false,
      },
      {
        unit: '',
        alignment: 'right',
        visible: false,
      },
    ];
  },

  _getAttemptLineChartSelectedLine() {
    return this.state.selectedAttemptLine;
  },

  _getDurationLineChartSelectedLine() {
    return this.state.selectedDurationLine;
  },

  _getAppIdSelectOptions() {
    return reduce(this.state.appIds, (result, id) => {
      const option = { value: id, label: id };
      result.push(option);
      return result;
    }, []);
  },

  _getMonthlyStats(type, month, year) {
    const { identity } = this.context.params;

    const selectedMonth = (month || month === 0) ? month : this.state.selectedMonth;
    const selectedYear = year || this.state.selectedYear;

    const queryTime = moment().month(selectedMonth).year(selectedYear);

    this.context.executeAction(fetchCallsStatsMonthly, {
      fromTime: queryTime.startOf('month').format('x'),
      toTime: queryTime.endOf('month').format('x'),
      carrierId: identity,
      type: !isUndefined(type) ? type : this.state.type,
    });
  },

  _getMonthlyUser() {
    const { thisMonthUser, lastMonthUser } = this.state;
    const userChange = thisMonthUser - lastMonthUser;

    let direction;

    if (userChange > 0) {
      direction = 'up';
    } else if (userChange < 0) {
      direction = 'down';
    } else {
      direction = 'flat';
    }

    return {
      total: thisMonthUser,
      change: userChange,
      percent: userChange && lastMonthUser ? Math.round((userChange / lastMonthUser) * 100) : '-',
      direction,
    };
  },

  _getLastXDaysStats(type, lastXDays) {
    const { identity } = this.context.params;
    const timeRange = lastXDays || this.state.selectedLastXDays;

    const { from, to, quantity: selectedLastXDays, timescale } = parseTimeRange(timeRange);

    this.context.executeAction(fetchCallsStatsTotal, {
      fromTime: from,
      toTime: to,
      carrierId: identity,
      timescale,
      type: !isUndefined(type) ? type : this.state.type,
    });
  },

  _getTotalCallAttempt() {
    const totalCall = reduce(this.state.totalAttemptStats, (total, stat) => {
      total += stat.v;
      return total;
    }, 0);

    return totalCall;
  },

  _getSuccessfulAttempt() {
    const totalSuccess = reduce(this.state.successAttemptStats, (success, stat) => {
      success += stat.v;
      return success;
    }, 0);

    return totalSuccess;
  },

  _getAverageSuccessfulRate() {
    const totalAttempt = this._getTotalCallAttempt();
    const totalSuccess = this._getSuccessfulAttempt();

    return (totalSuccess / totalAttempt) * 100;
  },

  _getTotalCallDuration() {
    const totalDurationInMs = reduce(this.state.totalDurationStats, (total, stat) => {
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
    const totalSuccess = this._getSuccessfulAttempt();
    const totalDuration = this._getTotalCallDuration();

    return (totalDuration / totalSuccess) * 60;
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

    this.setState({ selectedMonth, selectedYear, thisMonthUser: null, lastMonthUser: null });
    this._getMonthlyStats(this.state.type, selectedMonth, selectedYear);
  },

  render() {
    const monthlyUserStats = this._getMonthlyUser();
    const appIds = this._getAppIdSelectOptions();
    const { formatMessage } = this.props.intl;

    return (
      <div className="row">
        <FilterBar.Wrapper>
          <FilterBarNavigation section="call" tab="overview" />
          <FilterBar.LeftItems>
            <a
              className={classNames({ active: this.state.type === CALL_TYPE.ALL })}
              onClick={ bindKey(this, 'changeCallType', CALL_TYPE.ALL) }
            ><FormattedMessage id="all" defaultMessage="All" /></a>
            <a
              className={classNames({ active: this.state.type === CALL_TYPE.ONNET })}
              onClick={ bindKey(this, 'changeCallType', CALL_TYPE.ONNET) }
            >
              <FormattedMessage id="onnet" defaultMessage="Onnet" />
            </a>
            <a
              className={classNames({ active: this.state.type === CALL_TYPE.OFFNET })}
              onClick={ bindKey(this, 'changeCallType', CALL_TYPE.OFFNET) }
            >
              <FormattedMessage id="offnet" defaultMessage="Offnet" />
            </a>
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
              title={formatMessage(MESSAGES.monthlyVoiceCallUser)}
              caption={(
                <LastUpdateTime
                  type={TIME_TYPES.MONTHLY}
                  time={moment({
                    year: this.state.selectedYear,
                    month: this.state.selectedMonth,
                  }).format(SHORT_DATE_FORMAT)}
                />
              )}
            >
              <div className={classNames('tiny-spinner', { active: this.isMonthlyStatsLoading() })}></div>
              <DateSelector
                className={classNames({ disabled: this.isMonthlyStatsLoading() })}
                date={this.getMonthlyStatsDate()}
                minDate={moment().subtract(1, 'months').subtract(1, 'years').startOf('month').format(SHORT_DATE_FORMAT)}
                maxDate={moment().subtract(1, 'months').endOf('month').format(SHORT_DATE_FORMAT)}
                onChange={this.handleMonthlyStatsChange}
              />
            </Panel.Header>
            <Panel.Body customClass="narrow no-padding">
              <DataGrid.Wrapper>
                <DataGrid.Cell
                  title={formatMessage(MESSAGES.monthlyVoiceCallUser)}
                  data={monthlyUserStats.total}
                  changeDir={monthlyUserStats.direction}
                  changeAmount={monthlyUserStats.change}
                  changeEffect="positive"
                  changePercentage={monthlyUserStats.percent}
                  isLoading={this.isMonthlyStatsLoading()}
                />
              </DataGrid.Wrapper>
            </Panel.Body>
          </Panel.Wrapper>
        </div>

        <div className="large-24 columns">
          <Panel.Wrapper>
            <Panel.Header
              customClass="narrow"
              title={formatMessage(MESSAGES.callBehaviourStatistics)}
              caption={(
                <LastUpdateTime type={TIME_TYPES.TIME_RANGE} time={this.state.selectedLastXDays} />
              )}
            >
              <div className={classNames('tiny-spinner', { active: this.isTotalStatsLoading() })}></div>
              <TimeFramePicker
                className={classNames({ disabled: this.isTotalStatsLoading() })}
                frames={TIME_FRAMES}
                currentFrame={this.state.selectedLastXDays}
                onChange={this.timeFrameChange}
              />
            </Panel.Header>
            <Panel.Body customClass="narrow no-padding">
              <div className="inner-wrap">
                <div className="chart-cell large-24 columns">
                  <div className="chart-cell__header row">
                  </div>
                  <div className="chart-cell__chart row">
                    <DataGrid.Wrapper>
                      <DataGrid.Cell
                        title={formatMessage(MESSAGES.totalCallsAttempts)}
                        data={this._getTotalCallAttempt()}
                        isLoading={this.isTotalStatsLoading()}
                      />
                      <DataGrid.Cell
                        title={`${formatMessage(MESSAGES.answerSeizureRatio)} (%)`}
                        data={this._getAverageSuccessfulRate()}
                        formatter={normalizeDurationInMS}
                        unit="%"
                        isLoading={this.isTotalStatsLoading()}
                      />
                      <DataGrid.Cell
                        title={formatMessage(MESSAGES.totalCallDuration)}
                        data={this._getTotalCallDuration()}
                        formatter={normalizeDurationInMS}
                        unit={formatMessage(i18nMessages.minutes)}
                        isLoading={this.isTotalStatsLoading()}
                      />
                      <DataGrid.Cell
                        title={formatMessage(MESSAGES.averageCallDuration)}
                        data={this._getAverageCallDuration()}
                        formatter={normalizeDurationInMS}
                        unit={formatMessage(i18nMessages.seconds)}
                        isLoading={this.isTotalStatsLoading()}
                      />
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
                        <FormattedMessage
                          id="calls.overview.callSuccessAnalytic"
                          defaultMessage="Call Success Analytic"
                        />
                        <span> - ASR (%)</span>
                      </div>
                      <div className="chart-cell__header__subtitle">
                        <FormattedMessage
                          id="calls.overview.answerSeizureRatio"
                          defaultMessage="Answer Seizure Ratio"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="line-chart chart-cell__chart row">
                    <CombinationChart
                      alignTicks={false}
                      className="attempt-line"
                      lines={this._getAttemptLineChartData()}
                      shareTooltip
                      showLegend
                      xAxis={this._getLineChartXAxis()}
                      yAxis={[
                        {
                          alignment: 'left',
                          visible: false,
                        },
                        {
                          unit: '%',
                          alignment: 'left',
                        },
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
                        <FormattedMessage
                          id="calls.overview.callDurationAnalytic"
                          defaultMessage="Call Duration Analytic"
                        />
                        <span> - ACD</span>s
                      </div>
                      <div className="chart-cell__header__subtitle">
                        <FormattedMessage
                          id="calls.overview.averageCallDuration"
                          defaultMessage="Average Call Duration"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="line-chart chart-cell__chart row">
                    <CombinationChart
                      alignTicks={false}
                      className="attempt-line"
                      lines={this._getDurationLineChartData()}
                      shareTooltip
                      showLegend
                      xAxis={this._getLineChartXAxis()}
                      yAxis={this._getDurationLineChartYAxis()}
                    />
                  </div>
                </div>
              </div>
            </Panel.Body>
          </Panel.Wrapper>
        </div>
      </div>
    );
  },

  isMonthlyStatsLoading() {
    const monthlyUserStats = this._getMonthlyUser();
    return isNull(monthlyUserStats.total) && isNull(this.state.monthlyStatsError);
  },

  isTotalStatsLoading() {
    return isNull(this.state.totalAttemptStats) && isNull(this.state.totalStatsError);
  },
});

export default injectIntl(CallsOverview);
