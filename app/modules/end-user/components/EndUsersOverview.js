import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import Select from 'react-select';
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl';

import moment from 'moment';
import classNames from 'classnames';
import { isNull, merge, max, clone, reduce, isEmpty } from 'lodash';
import getMapConfig from '../utils/getMapConfig';
import MAP_DATA from '../constants/mapData';

import { FluxibleMixin } from 'fluxible-addons-react';

import * as FilterBar from '../../../main/components/FilterBar';
import * as Panel from './../../../main/components/Panel';
import ColorRadioButton from '../../../main/components/ColorRadioButton';
import LineChart from '../../../main/components/LineChart';
import TimeFramePicker from '../../../main/components/TimeFramePicker';
import { parseTimeRange } from '../../../utils/timeFormatter';
import * as DataGrid from '../../../main/statistics/components/DataGrid';
import PercentageChart from '../../../main/components/PercentageChart';
import DateSelector from '../../../main/components/DateSelector';

import EndUsersOverviewStore from '../stores/EndUsersOverviewStore';
import EndUsersRegistrationStatsStore from '../stores/EndUsersRegistrationStatsStore';
import EndUsersGeographicStatsStore from '../stores/EndUsersGeographicStatsStore';
import ApplicationStore from '../../../main/stores/ApplicationStore';

import fetchEndUsersStatsMonthly from '../actions/fetchEndUsersStatsMonthly';
import fetchEndUsersStatsTotal from '../actions/fetchEndUsersStatsTotal';
import fetchRegistrationStats from '../actions/fetchEndUsersRegistrationStats';
import fetchDeviceStats from '../actions/fetchDeviceStats';
import fetchGeographicStats from '../actions/fetchGeographicStats';
import clearEndUsersStats from '../actions/clearEndUsersStats';

const TIME_FRAMES = ['7 days', '30 days', '60 days', '90 days'];
const gChartContainerId = 'registrationByCountry';

const LAST_UPDATE_TIME_FORMAT = 'MMM DD, YYYY H:mm';

const defaultQueryMonth = moment().subtract(1, 'month');

const PLATFORM_NAME = {
  ios: 'IOS',
  android: 'Android',
  phone: 'Windows Phone',
  'windows.phone': 'Windows Phone',
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

const MESSAGES = defineMessages({
  totalUser: {
    id: 'endUser.overview.totalUser',
    defaultMessage: 'Total User',
  },
  totalRegisteredUser: {
    id: 'endUser.overview.totalRegisteredUser',
    defaultMessage: 'Total Registered User',
  },
  newRegisteredUser: {
    id: 'endUser.overview.newRegisteredUser',
    defaultMessage: 'New Registered User',
  },
  activeUser: {
    id: 'endUser.overview.activeUser',
    defaultMessage: 'Active User',
  },
  dailyStatistics: {
    id: 'endUser.overview.dailyStatistics',
    defaultMessage: 'Daily Statistics',
  },
  monthlyStats: {
    id: 'overview.monthlyStats',
    defaultMessage: 'Monthly Statistic',
  },
});

const EndUsersOverview = React.createClass({
  displayName: 'EndUsersOverview',

  contextTypes: {
    params: PropTypes.object,
    executeAction: PropTypes.func.isRequired,
  },

  mixins: [FluxibleMixin],

  statics: {
    storeListeners: {
      onEndUsersOverviewChange: EndUsersOverviewStore,
      onEndUsersRegistrationStatsChange: EndUsersRegistrationStatsStore,
      // WLP-595
      // Disable Country Table field as SDK does not support country data at this moment
      // and the capability settings for features are pending implementation
      // onEndUsersGeographicStatsChange: EndUsersGeographicStatsStore,
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
    // WLP-595
    // Disable Country Table field as SDK does not support country data at this moment
    // and the capability settings for features are pending implementation
    // this._getGeographicStats();
  },

  componentWillUnmount() {
    this.context.executeAction(clearEndUsersStats);
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
    // WLP-595
    // Disable Country Table field as SDK does not support country data at this moment
    // and the capability settings for features are pending implementation
    // this._getGeographicStats(time);
  },

  getChangeColor(value) {
    if (!value) return '';

    return (value > 0) ? 'positive' : 'negative';
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

  getMonthlyStatsDate() {
    return moment({
      month: this.state.selectedMonth,
      year: this.state.selectedYear,
    }).format('L');
  },

  getLastUpdate(date) {
    const lastUpdate = moment(date).endOf('month').format(LAST_UPDATE_TIME_FORMAT);
    return `Data updated till: ${lastUpdate}`;
  },

  getLastUpdateFromTimeFrame() {
    const timeframe = this.state.selectedLastXDays;
    const { to, timescale } = parseTimeRange(timeframe);
    const lastUpdate = timescale === 'hour' ? moment(to).format(LAST_UPDATE_TIME_FORMAT) : moment(to).endOf(timescale).format(LAST_UPDATE_TIME_FORMAT);
    return `Data updated till: ${lastUpdate}`;
  },

  render() {
    const { formatMessage } = this.props.intl;
    const { role, identity } = this.context.params;
    const totalRegisteredUser = this._getTotalRegisteredUser();
    const monthlyRegisteredUserStats = this._getMonthlyRegisteredUserStats();
    const monthlyActiveUserStats = this._getMonthlyActiveUserStats();
    const appIds = this._getAppIdSelectOptions();

    return (
      <div className="row">
        <FilterBar.Wrapper>
          <FilterBar.NavigationItems>
            <Link to={`/${role}/${identity}/end-users/overview`} activeClassName="active">
              <FormattedMessage id="overview" defaultMessage="Overview" />
            </Link>
            <Link to={`/${role}/${identity}/end-users/details`} activeClassName="active">
              <FormattedMessage id="detailsReport" defaultMessage="Details Report" />
            </Link>
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
                title={formatMessage(MESSAGES.totalUser)}
                caption={`Data updated till: ${moment().subtract(1, 'day').endOf('day').format(LAST_UPDATE_TIME_FORMAT)}`}
              />
              <Panel.Body customClass="narrow no-padding">
                <DataGrid.Wrapper>
                  <DataGrid.Cell
                    title={formatMessage(MESSAGES.totalRegisteredUser)}
                    data={totalRegisteredUser}
                    changeAmount=" "
                  />
                </DataGrid.Wrapper>
              </Panel.Body>
            </Panel.Wrapper>
          </div>

          <div className="large-24 columns">
            <Panel.Wrapper>
              <Panel.Header
                customClass="narrow"
                title={formatMessage(MESSAGES.monthlyStats)}
                caption={this.getLastUpdate({ year: this.state.selectedYear, month: this.state.selectedMonth })}
              >
                <div className={classNames('tiny-spinner', { active: this.isMonthlyStatsLoading() })}></div>
                <DateSelector
                  className={classNames({ disabled: this.isMonthlyStatsLoading() })}
                  date={this.getMonthlyStatsDate()}
                  minDate={moment().subtract(1, 'months').subtract(1, 'years').startOf('month').format('L')}
                  maxDate={moment().subtract(1, 'months').endOf('month').format('L')}
                  onChange={this.handleMonthlyStatsChange}
                />
              </Panel.Header>
              <Panel.Body customClass="narrow no-padding">
                <DataGrid.Wrapper>
                  <DataGrid.Cell
                    title={formatMessage(MESSAGES.newRegisteredUser)}
                    data={monthlyRegisteredUserStats.total}
                    changeDir={monthlyRegisteredUserStats.direction}
                    changeAmount={monthlyRegisteredUserStats.change}
                    changeEffect="positive"
                    changePercentage={monthlyRegisteredUserStats.percent}
                    isLoading={this.isMonthlyStatsLoading()}
                  />
                  <DataGrid.Cell
                    title={formatMessage(MESSAGES.activeUser)}
                    data={monthlyActiveUserStats.total}
                    changeDir={monthlyActiveUserStats.direction}
                    changeAmount={monthlyActiveUserStats.change}
                    changeEffect="positive"
                    changePercentage={monthlyActiveUserStats.percent}
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
                title={formatMessage(MESSAGES.dailyStatistics)}
                caption={this.getLastUpdateFromTimeFrame()} >
                <div className={classNames('tiny-spinner', { active: this.isTotalStatsLoading() })}></div>
                <TimeFramePicker
                  className={classNames({ disabled: this.isTotalStatsLoading() })}
                  frames={TIME_FRAMES}
                  currentFrame={this.state.selectedLastXDays}
                  onChange={this.onTimeFrameChange}
                />
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
                </div>
              </Panel.Body>
            </Panel.Wrapper>
            <Panel.Wrapper>
              <Panel.Body customClass="narrow no-padding">
                <div className="inner-wrap">
                  <div className="chart-cell large-24 columns">
                    <div className="chart-cell__header row">
                      <div className="large-4 columns">
                        <div className="chart-cell__header__title text-center">
                          <FormattedMessage
                            id="endUser.overview.userDistributionByOs"
                            defaultMessage="User Distribution by OS"
                          />
                        </div>
                      </div>
                      <div className="large-3 columns end chart-cell__overview">
                        <div className="chart-cell__overview__value">{ this._getDeviceTotal() }</div>
                        <div className="chart-cell__overview__unit">
                          <FormattedMessage
                            id="endUser.overview.totalUser"
                            defaultMessage="Total User"
                          />
                        </div>
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
                                unit="users"
                              />
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

  handleMonthlyStatsChange(date) {
    const momentDate = moment(date, 'L');
    const selectedMonth = momentDate.month();
    const selectedYear = momentDate.year();

    this.setState({
      selectedMonth,
      selectedYear,
    });

    this._getMonthlyStats(selectedMonth, selectedYear);
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

  _getStats() {
    const { identity } = this.context.params;

    this.context.executeAction(fetchEndUsersStatsTotal, {
      fromTime: moment().startOf('day').format('x'),
      toTime: moment().endOf('day').format('x'),
      carrierId: identity,
    });
  },

  _getAppIdSelectOptions() {
    return reduce(this.state.appIds, (result, id) => {
      const option = { value: id, label: id };
      result.push(option);
      return result;
    }, []);
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
    const { thisMonthRegistered, lastMonthRegistered } = this.state;
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
    function tooltipFormatter (label, x, y) {
      return `
              <div style="text-align: center">
                <div>${moment(x).local().format(TOOLTIP_TIME_FORMAT)}</div>
                <div>${label}: ${y}</div>
              </div>
            `;
    };

    return !isEmpty(this.state.lastXDaysRegisteredUser) && !isEmpty(this.state.lastXDaysActiveUser) ? [
      {
        name: STATS_TYPE.REGISTERED_USER,
        data: reduce(this.state.lastXDaysRegisteredUser, (result, stat) => { result.push(Math.round(stat.v)); return result; }, []),
        color: '#FB3940',
        tooltipFormatter: _.partial(tooltipFormatter, 'New Registered Users'),
      },
      {
        name: STATS_TYPE.ACTIVE_USER,
        data: reduce(this.state.lastXDaysActiveUser, (result, stat) => { result.push(Math.round(stat.v)); return result; }, []),
        color: '#21C031',
        tooltipFormatter: _.partial(tooltipFormatter, 'Active Users'),
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

  _getMonthlyStats(month, year) {
    const { identity } = this.context.params;

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
    const { identity } = this.context.params;
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
    const { identity } = this.context.params;
    const timeRange = lastXDays || this.state.selectedLastXDays;

    const { from, to, timescale } = parseTimeRange(timeRange);

    this.context.executeAction(fetchGeographicStats, {
      fromTime: from,
      toTime: to,
      carrierId: identity,
      timescale,
    });
  },

  _getDeviceStats() {
    const { identity } = this.context.params;

    this.context.executeAction(fetchDeviceStats, {
      fromTime: moment().startOf('day').format('x'),
      toTime: moment().endOf('day').format('x'),
      carrierId: identity,
    });
  },

  isMonthlyStatsLoading() {
    const monthlyRegisteredUserStats = this._getMonthlyRegisteredUserStats();
    return isNull(monthlyRegisteredUserStats.total) && isNull(this.state.monthlyStatsError);
  },

  isTotalStatsLoading() {
    return isNull(this.state.lastXDaysRegisteredUser) && isNull(this.state.totalStatsError);
  },
});

export default injectIntl(EndUsersOverview);
