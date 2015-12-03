import React from 'react';
import { Link } from 'react-router';
import Select from 'react-select';
import classNames from 'classnames';
import moment from 'moment';
import _ from 'lodash';
import {concurrent} from 'contra';

import FluxibleMixin from 'fluxible/addons/FluxibleMixin';
import AuthMixin from '../../../utils/AuthMixin';

import * as FilterBar from '../../../main/components/FilterBar';
import * as Panel from './../../../main/components/Panel';
import ColorRadioButton from '../../../main/components/ColorRadioButton';
import LineChart from '../../../main/components/LineChart';
import TimeFramePicker, { parseTimeRange } from '../../../main/components/TimeFramePicker';
import * as DataGrid from '../../../main/statistics/components/DataGrid';

import EndUsersOverviewStore from '../stores/EndUsersOverviewStore';
import ApplicationStore from '../../../main/stores/ApplicationStore';

import fetchEndUsersStatsMonthly from '../actions/fetchEndUsersStatsMonthly';
import fetchEndUsersStatsTotal from '../actions/fetchEndUsersStatsTotal';
import fetchEndUsersStats from '../actions/fetchEndUsersStats';

const YEARS_BACKWARD = 5;

const TIME_FRAMES = ['7 days', '30 days', '60 days', '90 days'];

const debug = require('debug')('app:end-user/components/EndUsersOverview');

const defaultQueryMonth = moment().subtract(1, 'month');

const STATS_TYPE = {
  REGISTERED_USER: 'registereduser',
  ACTIVE_USER: 'activeuser'
};

const LINECHART_TOGGLES = [
  {
    id: STATS_TYPE.REGISTERED_USER,
    title: 'new registered user',
    color: 'red'
  },
  {
    id: STATS_TYPE.ACTIVE_USER,
    title: 'active user',
    color: 'green'
  }
];

const TOOLTIP_TIME_FORMAT = 'lll';

const EndUsersOverview = React.createClass({
  displayName: 'EndUsersOverview',

  contextTypes: {
    router: React.PropTypes.func.isRequired,
    executeAction: React.PropTypes.func.isRequired
  },

  mixins: [FluxibleMixin, AuthMixin],

  statics: {
    storeListeners: {
      onEndUsersOverviewChange: EndUsersOverviewStore
    }
  },

  getInitialState() {
    return {
      appIds: this.getStore(ApplicationStore).getAppIds() || [],
      appId: this.getStore(ApplicationStore).getDefaultAppId(),
      selectedMonth: defaultQueryMonth.get('month'),
      selectedYear: defaultQueryMonth.get('year'),
      selectedLastXDays: TIME_FRAMES[1]
    }
  },

  componentDidMount() {
    this._getStats();
    this._getMonthlyStats();
    this._getLastXDaysStats();
  },

  onEndUsersOverviewChange() {
    this.setState(this.context.getStore(EndUsersOverviewStore).getState());
  },

  onAppIdChange(appId) {
    this.setState({ appId });
  },

  onTimeFrameChange(time) {
    this.setState({ selectedLastXDays: time });

    //// THIS IS A HACK FOR LINECHART
    //// the lines key has to be cleared (e.g. set to null)
    //// in order to reset the LineChart
    this.setState({
      lastXDaysRegisteredUser: null, lastXDaysActiveUser: null
    });

    this._getLastXDaysStats(time);
  },

  _getStats() {
    let { identity } = this.context.router.getCurrentParams();

    this.context.executeAction(fetchEndUsersStatsTotal, {
      fromTime: moment().startOf('day').format('x'),
      toTime: moment().endOf('day').format('x'),
      carrierId: identity
    });
  },

  _getMonthlyStats(month, year) {
    let { identity } = this.context.router.getCurrentParams();

    let selectedMonth = (month || month === 0) ? month : this.state.selectedMonth;
    let selectedYear = year || this.state.selectedYear;

    let queryTime = moment().month(selectedMonth).year(selectedYear);

    this.context.executeAction(fetchEndUsersStatsMonthly, {
      fromTime: queryTime.startOf('month').format('x'),
      toTime: queryTime.endOf('month').format('x'),
      carrierId: identity
    });
  },

  _getLastXDaysStats(lastXDays) {
    let { identity } = this.context.router.getCurrentParams();
    let timeRange = lastXDays || this.state.selectedLastXDays;

    let { from, to, quantity: selectedLastXDays, timescale } = parseTimeRange(timeRange);

    this.context.executeAction(fetchEndUsersStats, {
      fromTime: from,
      toTime: to,
      carrierId: identity,
      timescale
    })
  },

  getChangeColor(value) {
    if (!value) {
      return '';
    }

    return (value > 0) ? 'positive' : 'negative';
  },

  monthlyStatsMonthChange(month) {
    this.setState({ selectedMonth: month });
    this._getMonthlyStats(month);
  },

  monthlyStatsYearChange(year) {
    this.setState({ selectedYear: year });
    this._getMonthlyStats(null, year);
  },

  toggleSummaryType(summaryType) {
    this.setState({ selectedLine: summaryType });
  },

  _getAppIdSelectOptions() {
    return _.reduce(this.state.appIds, (result, id) => {
      var option = { value: id, label: id };
      result.push(option);
      return result;
    }, [])
  },

  _getMonths() {
    let monthArray = Array.apply(0, Array(12)).map((_, i ) => { return i });

    return _.reduce(monthArray, (result, n) => {
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
  },

  _getTotalRegisteredUser() {
    let { totalRegisteredUser } = this.state;
    return totalRegisteredUser;
  },

  _getMonthlyActiveUserStats() {
    let { thisMonthActive, lastMonthActive } = this.state;
    let activeUserChange = thisMonthActive - lastMonthActive;

    return {
      total: thisMonthActive,
      change: thisMonthActive - lastMonthActive,
      percent: activeUserChange && lastMonthActive ? Math.round((activeUserChange / lastMonthActive) * 100) : '-',
      direction: activeUserChange > 0 ? 'up' : 'down'
    };
  },

  _getMonthlyRegisteredUserStats() {
    let { thisMonthRegistered, lastMonthRegistered  } = this.state;
    let registeredUserChange = thisMonthRegistered - lastMonthRegistered;

    return {
      total: thisMonthRegistered,
      change: registeredUserChange,
      percent: registeredUserChange && lastMonthRegistered ? Math.round((registeredUserChange / lastMonthRegistered) * 100) : '-',
      direction: (registeredUserChange > 0) ? 'up' : 'down'
    };
  },

  _getLineChartXAxis() {
    let { from, quantity, timescale } = parseTimeRange(this.state.selectedLastXDays);

    return {
      start: from,
        tickCount: parseInt(quantity),
        tickInterval: (timescale === 'day' ? 24 : 1) * 3600 * 1000
    };
  },

  _getLineChartData() {
    let tooltipFormatter = (x, y) => {
      return `
              <div style="text-align: center">
                <div>${moment(x).local().format(TOOLTIP_TIME_FORMAT)}</div>
                <div>Success Attempts: ${y}</div>
              </div>
            `;
    };

    return !_.isEmpty(this.state.lastXDaysRegisteredUser) && !_.isEmpty(this.state.lastXDaysActiveUser) ? [
      {
        name: STATS_TYPE.REGISTERED_USER,
        data: _.reduce(this.state.lastXDaysRegisteredUser, (result, stat) => { result.push(Math.round(stat.v)); return result; }, []),
        color: '#FB3940',
        tooltipFormatter: tooltipFormatter
      },
      {
        name: STATS_TYPE.ACTIVE_USER,
        data: _.reduce(this.state.lastXDaysActiveUser, (result, stat) => { result.push(Math.round(stat.v)); return result; }, []),
        color: '#21C031',
        tooltipFormatter: tooltipFormatter
      }
    ] : null;
  },

  _getLineChartSelectedLine() {
    return this.state.selectedLine;
  },

  render() {
    let { role, identity } = this.context.router.getCurrentParams();
    let totalRegisteredUser = this._getTotalRegisteredUser();
    let monthlyRegisteredUserStats = this._getMonthlyRegisteredUserStats();
    let monthlyActiveUserStats = this._getMonthlyActiveUserStats();

    return (
      <div className="row">
        <FilterBar.Wrapper>
          <FilterBar.NavigationItems>
            <Link to="end-users-overview" params={{ role, identity }}>Overview</Link>
            <Link to="end-users-details" params={{ role, identity }}>Details Report</Link>
          </FilterBar.NavigationItems>
          <FilterBar.LeftItems>

          </FilterBar.LeftItems>
          <FilterBar.RightItems>
            <Select
              name="appid"
              className="end-users-details__app-select"
              options={this._getAppIdSelectOptions()}
              value={"Application ID: " + (this.state.appId ? this.state.appId : "-")}
              clearable={false}
              searchable={false}
              onChange={this.onAppIdChange}
            />
          </FilterBar.RightItems>
        </FilterBar.Wrapper>

        <div className="inner-wrap end-users-overview">
          <div className="large-7 columns">
            <Panel.Wrapper>
              <Panel.Header customClass="narrow" title="Total User" />
              <Panel.Body customClass="narrow no-padding">
                <DataGrid.Wrapper>
                  <DataGrid.Cell
                    title="Total Registered User"
                    data={totalRegisteredUser}
                    changeAmount=" " />
                </DataGrid.Wrapper>
              </Panel.Body>
            </Panel.Wrapper>
          </div>

          <div className="large-17 columns">
            <Panel.Wrapper>
              <Panel.Header customClass="narrow" title="Monthly Statistics">
                <div className="input-group picker month right">
                  <Select
                    name="month-picker"
                    className="end-users-overview__month-picker left"
                    options={this._getMonths()}
                    value={this.state.selectedMonth}
                    clearable={false}
                    searchable={false}
                    onChange={this.monthlyStatsMonthChange} />
                  <Select
                    name="year-picker"
                    className="end-users-overview__year-picker left"
                    options={this._getYears()}
                    value={this.state.selectedYear}
                    clearable={false}
                    searchable={false}
                    onChange={this.monthlyStatsYearChange} />
                </div>
              </Panel.Header>
              <Panel.Body customClass="narrow no-padding">
                <DataGrid.Wrapper>
                  <DataGrid.Cell
                    title="New Registered User"
                    data={monthlyRegisteredUserStats.total}
                    changeDir={monthlyRegisteredUserStats.direction}
                    changeAmount={monthlyRegisteredUserStats.change}
                    changePercentage={monthlyRegisteredUserStats.percent} />
                  <DataGrid.Cell
                    title="Active User"
                    data={monthlyActiveUserStats.total}
                    changeDir={monthlyActiveUserStats.direction}
                    changeAmount={monthlyActiveUserStats.change}
                    changePercentage={monthlyActiveUserStats.percent} />
                </DataGrid.Wrapper>
              </Panel.Body>
            </Panel.Wrapper>
          </div>

          <div className="large-24 columns">
            <Panel.Wrapper>
              <Panel.Header customClass="narrow" title="Statistics">
                <div className="input-group right">
                  <label className="left">Past:</label>
                  <TimeFramePicker
                    frames={TIME_FRAMES}
                    customClass={['input', 'right']}
                    currentFrame={this.state.selectedLastXDays}
                    onChange={this.onTimeFrameChange} />
                </div>
              </Panel.Header>
              <Panel.Body customClass="narrow no-padding">
                <div className="inner-wrap">
                  <div className="chart-cell row">
                    <div className="chart-cell__header inner-wrap">
                      <div className="large-24 columns">
                        <div className="large-4 columns">
                          <div className="chart-cell__header__title">Registration</div>
                        </div>
                        { /* // DESIGN IS NOT FINALISED
                        <div className="large-4 columns end verification-overview__attempt__datetime">
                          <div className="verification-overview__value">2219</div>
                          <div className="verification-overview__title">New registered User</div>
                        </div>
                        */ }
                      </div>
                    </div>
                    <div className="large-24 columns">
                      <div className="chart-cell__line-toggle">
                        <ul className="inner-wrap">
                          {
                            LINECHART_TOGGLES.map((toggle) => {
                              return (
                                <li key={toggle.id} className="verification-overview__title">
                                  <ColorRadioButton
                                    group="verificationAttempt"
                                    label={toggle.title}
                                    value={toggle.id}
                                    color={toggle.color}
                                    checked={this.state.selectedLine === toggle.id}
                                    onChange={this.toggleSummaryType}
                                    location="left" />
                                </li>
                              );
                            })
                          }
                        </ul>
                      </div>
                    </div>
                    <div className="large-24 columns chart-cell__chart">
                      <LineChart
                        className="attempt-line"
                        lines={this._getLineChartData()}
                        xAxis={this._getLineChartXAxis()}
                        yAxis={{}}
                        selectedLine={this._getLineChartSelectedLine()} />
                    </div>
                  </div>
                </div>
              </Panel.Body>
            </Panel.Wrapper>
          </div>
        </div>
      </div>
    );
  }
});

export default EndUsersOverview;
