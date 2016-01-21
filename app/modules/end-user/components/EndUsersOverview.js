import React from 'react';
import { Link } from 'react-router';
import Select from 'react-select';
import moment from 'moment';
import { merge, max, clone, reduce, isEmpty, sortByOrder, values } from 'lodash';
import getMapConfig from '../utils/getMapConfig';
import MAP_DATA from '../constants/mapData';

import FluxibleMixin from 'fluxible/addons/FluxibleMixin';
import AuthMixin from '../../../utils/AuthMixin';

import * as FilterBar from '../../../main/components/FilterBar';
import * as Panel from './../../../main/components/Panel';
import ColorRadioButton from '../../../main/components/ColorRadioButton';
import LineChart from '../../../main/components/LineChart';
import TimeFramePicker, { parseTimeRange } from '../../../main/components/TimeFramePicker';
import * as DataGrid from '../../../main/statistics/components/DataGrid';
import PercentageChart from '../../../main/components/PercentageChart';
import CountryFlag from '../../../main/components/CountryFlag';

import EndUsersOverviewStore from '../stores/EndUsersOverviewStore';
import EndUsersRegistrationStatsStore from '../stores/EndUsersRegistrationStatsStore';
import EndUsersGeographicStatsStore from '../stores/EndUsersGeographicStatsStore';
import ApplicationStore from '../../../main/stores/ApplicationStore';

import fetchEndUsersStatsMonthly from '../actions/fetchEndUsersStatsMonthly';
import fetchEndUsersStatsTotal from '../actions/fetchEndUsersStatsTotal';
import fetchRegistrationStats from '../actions/fetchEndUsersRegistrationStats';
import fetchDeviceStats from '../actions/fetchDeviceStats';
import fetchGeographicStats from '../actions/fetchGeographicStats';

const YEARS_BACKWARD = 5;
const TIME_FRAMES = ['7 days', '30 days', '60 days', '90 days'];
const gChartContainerId = 'registrationByCountry';

const LAST_UPDATE_TIME_FORMAT = 'MMM DD, YYYY H mm';

const defaultQueryMonth = moment().subtract(1, 'month');

const PLATFORM_NAME = {
  ios: 'IOS',
  android: 'Android',
  phone: 'Windows Phone',
};

const STATS_TYPE = {
  REGISTERED_USER: 'registereduser',
  ACTIVE_USER: 'activeuser',
};

const LINECHART_TOGGLES = [
  {
    id: STATS_TYPE.REGISTERED_USER,
    title: 'new registered user',
    color: 'red',
  },
  {
    id: STATS_TYPE.ACTIVE_USER,
    title: 'active user',
    color: 'green',
  },
];

const TOOLTIP_TIME_FORMAT = 'lll';

const EndUsersOverview = React.createClass({
  displayName: 'EndUsersOverview',

  contextTypes: {
    router: React.PropTypes.func.isRequired,
    executeAction: React.PropTypes.func.isRequired,
  },

  mixins: [FluxibleMixin, AuthMixin],

  statics: {
    storeListeners: {
      onEndUsersOverviewChange: EndUsersOverviewStore,
      onEndUsersRegistrationStatsChange: EndUsersRegistrationStatsStore,
      onEndUsersGeographicStatsChange: EndUsersGeographicStatsStore,
    },
  },

  getInitialState() {
    return {
      appIds: this.getStore(ApplicationStore).getAppIds() || [],
      appId: this.getStore(ApplicationStore).getDefaultAppId(),
      selectedMonth: defaultQueryMonth.get('month'),
      selectedYear: defaultQueryMonth.get('year'),
      selectedLastXDays: TIME_FRAMES[1],
      selectedLine: STATS_TYPE.REGISTERED_USER,
    };
  },

  componentDidMount() {
    this._getStats();
    this._getMonthlyStats();
    this._getLastXDaysStats();
    this._getDeviceStats();
    this._getGeographicStats();
  },

  onEndUsersOverviewChange() {
    const states = this.context.getStore(EndUsersOverviewStore).getState();
    this.setState(states);
  },

  onEndUsersGeographicStatsChange() {
    const states = this.context.getStore(EndUsersGeographicStatsStore).getState();
    this.setState(merge(this.state, states));

    // Inject custom world data provided by Highmaps
    Highcharts.maps['custom/world'] = MAP_DATA;

    // Copy source data to be a new one for Highmap to avoid the behavior of changing source data
    const maxValue = max(states.geographicStats, country => country.total).total;
    this.geographicMap = new Highcharts.Map(getMapConfig(gChartContainerId, clone(states.geographicStats), maxValue));
  },

  onEndUsersRegistrationStatsChange() {
    const states = this.context.getStore(EndUsersRegistrationStatsStore).getState();
    this.setState(merge(this.state, states));
  },

  onAppIdChange(appId) {
    this.setState({ appId });
  },

  onTimeFrameChange(time) {
    this.setState({ selectedLastXDays: time });

    // THIS IS A HACK FOR LINECHART
    // the lines key has to be cleared (e.g. set to null)
    // in order to reset the LineChart
    this.setState({
      lastXDaysRegisteredUser: null, lastXDaysActiveUser: null,
    });

    this._getLastXDaysStats(time);
    this._getGeographicStats(time);
  },

  _getStats() {
    const { identity } = this.context.router.getCurrentParams();

    this.context.executeAction(fetchEndUsersStatsTotal, {
      fromTime: moment().startOf('day').format('x'),
      toTime: moment().endOf('day').format('x'),
      carrierId: identity,
    });
  },

  _getMonthlyStats(month, year) {
    const { identity } = this.context.router.getCurrentParams();

    const selectedMonth = (month || month === 0) ? month : this.state.selectedMonth;
    const selectedYear = year || this.state.selectedYear;

    const queryTime = moment().month(selectedMonth).year(selectedYear);

    this.context.executeAction(fetchEndUsersStatsMonthly, {
      fromTime: queryTime.startOf('month').format('x'),
      toTime: queryTime.endOf('month').format('x'),
      carrierId: identity,
      timeWindow: 'Month',
    });
  },

  _getLastXDaysStats(lastXDays) {
    const { identity } = this.context.router.getCurrentParams();
    const timeRange = lastXDays || this.state.selectedLastXDays;

    const { from, to, timescale } = parseTimeRange(timeRange);

    this.context.executeAction(fetchRegistrationStats, {
      fromTime: from,
      toTime: to,
      carrierId: identity,
      timescale,
    });
  },

  _getGeographicStats(lastXDays) {
    const { identity } = this.context.router.getCurrentParams();
    const timeRange = lastXDays || this.state.selectedLastXDays;

    const { from, to, timescale } = parseTimeRange(timeRange);

    this.context.executeAction(fetchGeographicStats, {
      fromTime: from,
      toTime: to,
      carrierId: identity,
      timescale,
    });
  },

  _getDeviceStats(lastXDays) {
    const { identity } = this.context.router.getCurrentParams();

    this.context.executeAction(fetchDeviceStats, {
      fromTime: moment().startOf('day').format('x'),
      toTime: moment().endOf('day').format('x'),
      carrierId: identity
    });
  },

  getChangeColor(value) {
    if (!value) return '';

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
    return reduce(this.state.appIds, (result, id) => {
      const option = { value: id, label: id };
      result.push(option);
      return result;
    }, []);
  },

  _getMonths() {
    const monthArray = Array.apply(0, Array(12)).map((_, i) => i);

    return reduce(monthArray, (result, n) => {
      const option = { value: n, label: moment().month(n).format('MMMM') };
      result.push(option);
      return result;
    }, []);
  },

  _getYears() {
    const years = [];

    for (let i = 0; i < YEARS_BACKWARD; i++) {
      years.push({
        value: (i > 0) ? moment().subtract(i, 'years').format('YYYY') : moment().format('YYYY'),
        label: (i > 0) ? moment().subtract(i, 'years').format('YYYY') : moment().format('YYYY'),
      });
    }

    return years;
  },

  _getTotalRegisteredUser() {
    const { totalRegisteredUser } = this.state;
    return totalRegisteredUser;
  },

  _getMonthlyActiveUserStats() {
    const { thisMonthActive, lastMonthActive } = this.state;
    const activeUserChange = thisMonthActive - lastMonthActive;

    return {
      total: thisMonthActive,
      change: thisMonthActive - lastMonthActive,
      percent: activeUserChange && lastMonthActive ? Math.round((activeUserChange / lastMonthActive) * 100) : '-',
      direction: activeUserChange > 0 ? 'up' : 'down',
    };
  },

  _getMonthlyRegisteredUserStats() {
    const { thisMonthRegistered, lastMonthRegistered  } = this.state;
    const registeredUserChange = thisMonthRegistered - lastMonthRegistered;

    return {
      total: thisMonthRegistered,
      change: registeredUserChange,
      percent: registeredUserChange && lastMonthRegistered ? Math.round((registeredUserChange / lastMonthRegistered) * 100) : '-',
      direction: (registeredUserChange > 0) ? 'up' : 'down',
    };
  },

  _getLineChartXAxis() {
    const { from, quantity, timescale } = parseTimeRange(this.state.selectedLastXDays);

    return {
      start: from,
      tickCount: parseInt(quantity, 10),
      tickInterval: (timescale === 'day' ? 24 : 1) * 3600 * 1000,
    };
  },

  _getLineChartData() {
    const tooltipFormatter = (x, y) => {
      return `
              <div style="text-align: center">
                <div>${moment(x).local().format(TOOLTIP_TIME_FORMAT)}</div>
                <div>Success Attempts: ${y}</div>
              </div>
            `;
    };

    return !isEmpty(this.state.lastXDaysRegisteredUser) && !isEmpty(this.state.lastXDaysActiveUser) ? [
      {
        name: STATS_TYPE.REGISTERED_USER,
        data: reduce(this.state.lastXDaysRegisteredUser, (result, stat) => { result.push(Math.round(stat.v)); return result; }, []),
        color: '#FB3940',
        tooltipFormatter: tooltipFormatter,
      },
      {
        name: STATS_TYPE.ACTIVE_USER,
        data: reduce(this.state.lastXDaysActiveUser, (result, stat) => { result.push(Math.round(stat.v)); return result; }, []),
        color: '#21C031',
        tooltipFormatter: tooltipFormatter,
      },
    ] : null;
  },

  _getLineChartSelectedLine() {
    return this.state.selectedLine;
  },

  _getDeviceTotal() {
    return reduce(this.state.deviceStats, (total, stat) => {
      total += stat.total;
      return total;
    }, 0);
  },

  _getGeographicTotal() {
    return reduce(this.state.geographicStats, (total, stat) => {
      total += stat.value;
      return total;
    }, 0);
  },

  /*
    WLP-595
    Disable Country Table field as SDK does not support country data at this moment
    and the capability settings for features are pending implementation
    */
  // _renderCountryTable() {
  //   const sortedCountries = sortByOrder(this.state.geographicStats, ['value'], ['desc'], values);
  //
  //   return (
  //     <div className="geographic-chart__country-table">
  //       <div className="geographic-chart__country-table__header row">
  //         <div className="large-15 columns">
  //           Location
  //         </div>
  //         <div className="large-9 columns">
  //           Registered
  //         </div>
  //       </div>
  //       {(
  //       sortedCountries.slice(0, 10) || []).map((country) => {
  //         return (
  //           <div className="geographic-chart__country-table__body row" key={country.code}>
  //             <div className="country large-15 columns">
  //               <CountryFlag code={country.code} />
  //               {country.name || EMPTY_CELL_PLACEHOLDER}
  //             </div>
  //             <div className="stats large-9 columns">{country.value || EMPTY_CELL_PLACEHOLDER}</div>
  //           </div>
  //         );
  //       })}
  //     </div>
  //   );
  //
  //   return (
  //     <table className="geographic-chart__country-table">
  //       <tr>
  //         <th>Location</th>
  //         <th>Attempts</th>
  //       </tr>
  //       {(
  //         sortedCountries.slice(0, 10) || []).map((country) => {
  //           return (
  //             <tr key={country.code}>
  //               <td>
  //                 <CountryFlag code={country.code} />
  //                 {country.name || EMPTY_CELL_PLACEHOLDER}
  //               </td>
  //               <td>{country.value || EMPTY_CELL_PLACEHOLDER}</td>
  //             </tr>
  //           );
  //         }
  //       )}
  //     </table>
  //   );
  // },

  render() {
    const { role, identity } = this.context.router.getCurrentParams();
    const totalRegisteredUser = this._getTotalRegisteredUser();
    const monthlyRegisteredUserStats = this._getMonthlyRegisteredUserStats();
    const monthlyActiveUserStats = this._getMonthlyActiveUserStats();
    const appIds = this._getAppIdSelectOptions();

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

        <div className="inner-wrap end-users-overview">
          <div className="large-24 columns">
            <Panel.Wrapper>
              <Panel.Header
                customClass="narrow"
                title="Total User"
                caption={`Data updated till: ${moment().subtract(1, 'day').endOf('day').format(LAST_UPDATE_TIME_FORMAT)}`}
              />
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

          <div className="large-24 columns">
            <Panel.Wrapper>
              <Panel.Header
                customClass="narrow"
                title="Monthly Statistics"
                caption={this.getLastUpdate({ year: this.state.selectedYear, month: this.state.selectedMonth })}
              >
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
                    changeEffect="positive"
                    changePercentage={monthlyRegisteredUserStats.percent} />
                  <DataGrid.Cell
                    title="Active User"
                    data={monthlyActiveUserStats.total}
                    changeDir={monthlyActiveUserStats.direction}
                    changeAmount={monthlyActiveUserStats.change}
                    changeEffect="positive"
                    changePercentage={monthlyActiveUserStats.percent} />
                </DataGrid.Wrapper>
              </Panel.Body>
            </Panel.Wrapper>
          </div>

          <div className="large-24 columns">
            <Panel.Wrapper>
              <Panel.Header customClass="narrow" title="Daily Statistics">
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
                  <div className="chart-cell large-24 columns">
                    <div className="chart-cell__header row"></div>
                    <div className="chart-cell__controls row">
                      <div className="chart-cell__line-toggle large-24 columns">
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
                    <div className="line-chart chart-cell__chart row">
                      <LineChart
                        className="attempt-line"
                        lines={this._getLineChartData()}
                        xAxis={this._getLineChartXAxis()}
                        yAxis={[{}]}
                        selectedLine={this._getLineChartSelectedLine()} />
                    </div>
                  </div>
                  {/*

                    WLP-595
                    Disable Country Table field as SDK does not support country data at this moment
                    and the capability settings for features are pending implementation

                  <div className="chart-cell large-24 columns">
                    <div className="chart-cell__header row">
                      <div className="large-4 columns">
                        <div className="chart-cell__header__title text-center">Registration by Country</div>
                      </div>
                      <div className="large-4 columns end chart-cell__overview">
                        <div className="chart-cell__overview__value">{ this._getGeographicTotal() }</div>
                        <div className="chart-cell__overview__unit">New Registered User</div>
                      </div>
                    </div>
                    <div className="map-chart chart-cell__chart row">
                      <div className="large-8 columns">
                        {this._renderCountryTable()}
                      </div>

                      <div className="large-16 columns">
                        <div id={gChartContainerId}>Loading maps...</div>
                      </div>
                    </div>
                  </div>
                  */}
                  <div className="chart-cell large-24 columns">
                    <div className="chart-cell__header row">
                      <div className="large-4 columns">
                        <div className="chart-cell__header__title text-center">Device OS</div>
                      </div>
                      <div className="large-3 columns end chart-cell__overview">
                        <div className="chart-cell__overview__value">{ this._getDeviceTotal() }</div>
                        <div className="chart-cell__overview__unit">Total User</div>
                      </div>
                    </div>
                    <div className="chart-cell__chart row">
                      {
                        this.state.deviceStats && this.state.deviceStats.map((stat) => {
                          const percentage = Math.round(stat.total / this._getDeviceTotal() * 100);

                          return (
                            <div className="large-12 columns left">
                              <PercentageChart
                                title={PLATFORM_NAME[stat.platform]}
                                percentage={percentage}
                                stat={stat.total}
                                unit="users" />
                            </div>
                          );
                        })
                      }
                    </div>
                  </div>
                </div>
              </Panel.Body>
            </Panel.Wrapper>
          </div>
        </div>
      </div>
    );
  },

  getLastUpdate(date) {
    const lastUpdate = moment(date).endOf('month').format(LAST_UPDATE_TIME_FORMAT);
    return `Data updated till: ${lastUpdate}`;
  },
});

export default EndUsersOverview;
