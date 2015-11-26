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

import EndUsersOverviewStore from '../stores/EndUsersOverviewStore';
import ApplicationStore from '../../../main/stores/ApplicationStore';
import AuthStore from '../../../main/stores/AuthStore';

import fetchEndUsersStatsMonthly from '../actions/fetchEndUsersStatsMonthly';
import fetchEndUsersStatsTotal from '../actions/fetchEndUsersStatsTotal';
import updateSelectedMonth from '../actions/updateSelectedMonth';
import updateSelectedYear from '../actions/updateSelectedYear';

const MONTHS = [0,1,2,3,4,5,6,7,8,9,10,11];
const YEARS_BACKWARD = 5;

const debug = require('debug')('app:end-user/components/EndUsersOverview');

const EndUsersOverview = React.createClass({
  displayName: 'EndUsersOverview',

  contextTypes: {
    router: React.PropTypes.func.isRequired,
    executeAction: React.PropTypes.func.isRequired
  },

  mixins: [FluxibleMixin, AuthMixin],

  statics: {
    storeListeners: {
      onEndUsersOverviewChange: EndUsersOverviewStore,
      onApplicationConfigChange: ApplicationStore
    }
  },

  componentDidMount() {
    this.autoSelectAppId();
  },

  componentDidUpdate(prevProps, prevState) {
    if (!this.state.appId) return;

    if (this.state.appId !== prevState.appId) {
      //this.resetCharts(this.state.timeRange);
      this.updateStats();
    }
  },

  getDefaultProps() {
    return {
      appIds: []
    };
  },

  getInitialState() {
    return {
      totalRegisteredUser: 0,
      thisMonthRegisteredUser: 0,
      lastMonthRegisteredUser: 0,
      thisMonthActiveUser: 0,
      lastMonthActiveUser: 0,
    };
  },

  onEndUsersOverviewChange() {
    this.setState(this.context.getStore(EndUsersOverviewStore).getState());
  },

  onApplicationConfigChange() {
    this.autoSelectAppId();
  },

  autoSelectAppId() {
    this.setState({
      appId: this.context.getStore(ApplicationStore).getDefaultAppId()
    });
  },

  onAppIdChange(appId) {
    this.setState({
      appId
    });
  },

  updateStats(month, year) {
    let { identity } = this.context.router.getCurrentParams();
    let monthlyStatsFrom = moment().subtract(1, 'months');
    let monthlyStatsTo = moment().subtract(1, 'months');

    if (month) {
      monthlyStatsFrom.month(month);
      monthlyStatsTo.month(month);
    }

    if (year) {
      monthlyStatsFrom.year(year);
      monthlyStatsTo.year(year);
    }

    this.context.executeAction(fetchEndUsersStatsTotal, {
      fromTime: moment().startOf('day').format('x'),
      toTime: moment().endOf('day').format('x'),
      carrierId: identity
    });

    this.context.executeAction(fetchEndUsersStatsMonthly, {
      fromTime: monthlyStatsFrom.startOf('month').format('x'),
      toTime: monthlyStatsTo.endOf('month').format('x'),
      carrierId: identity
    });
  },

  getChangeColor(value) {
    if (!value) {
      return '';
    }

    return (value > 0) ? 'positive' : 'negative';
  },

  monthlyStatsMonthChange(month) {
    this.updateStats(month, this.state.selectedYear);
    this.context.executeAction(updateSelectedMonth, month);
  },

  monthlyStatsYearChange(year) {
    this.updateStats(this.state.selectedMonth, year);
    this.context.executeAction(updateSelectedYear, year);
  },

  render() {
    let { role, identity } = this.context.router.getCurrentParams();

    let options = [];

    this.props.appIds.forEach(item => {
      options.push({
        value: item,
        label: item
      });
    });

    let totalRegisteredUser = this.state.totalRegisteredUser;

    let thisMonthRegisteredUser = this.state.thisMonthRegistered;
    let lastMonthRegisteredUser = this.state.lastMonthRegistered;
    let thisMonthRegisteredUserChange = thisMonthRegisteredUser - lastMonthRegisteredUser;

    let monthlyRegisteredUserStats = {
      total: thisMonthRegisteredUser,
      change: thisMonthRegisteredUserChange,
      percent: thisMonthRegisteredUserChange && lastMonthRegisteredUser ? Math.round((thisMonthRegisteredUserChange / lastMonthRegisteredUser) * 100) : '-',
      color: this.getChangeColor(thisMonthRegisteredUserChange), //positive or negative
      direction: (thisMonthRegisteredUserChange > 0) ? 'up' : 'down',
    };

    let thisMonthActiveUser = this.state.thisMonthActive;
    let lastMonthActiveUser = this.state.lastMonthActive;
    let activeUserChange = thisMonthActiveUser - lastMonthActiveUser;
    let activeUserChangePercent = Math.round((activeUserChange) / lastMonthActiveUser * 100);

    let monthlyActiveUserStats = {
      total: thisMonthActiveUser,
      change: activeUserChange,
      percent: activeUserChange && lastMonthActiveUser ? Math.round((activeUserChange / lastMonthActiveUser) * 100) : '-',
      color: this.getChangeColor(activeUserChange), //positive or negative
      direction: (activeUserChange > 0) ? 'up' : 'down',
    };

    let months = _.map(MONTHS, (month) => {
      return {
        value: month,
        label: moment().month(month).format('MMMM')
      }
    });

    let years = [];

    for (let i = 0; i < YEARS_BACKWARD; i++) {
      years.push({
        value: (i > 0) ? moment().subtract(i, 'years').format('YYYY') : moment().format('YYYY'),
        label: (i > 0) ? moment().subtract(i, 'years').format('YYYY') : moment().format('YYYY')
      });
    }

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
              options={options}
              value={"Application ID: " + (this.state.appId ? this.state.appId : "-")}
              clearable={false}
              searchable={false}
              onChange={this.onAppIdChange}
            />
          </FilterBar.RightItems>
        </FilterBar.Wrapper>

        <div className="end-users-overview row">
          <div className="large-6 columns">
            <Panel.Wrapper>
              <div className="header narrow"><h5 className="title">Total User</h5></div>
              <div className={classNames('body', 'end-users-overview__total', {error: this.state.attemptsError || this.state.pastAttemptsError})}>
                <section className={classNames(`large-24`, 'columns')}>
                  <div className="end-users-overview__title">Total Registered User</div>
                  <div className="end-users-overview__value">{totalRegisteredUser}</div>
                </section>
              </div>
            </Panel.Wrapper>
          </div>

          <div className="large-16 columns left">
            <Panel.Wrapper>
              <div className="inner-wrap header narrow">
                <h5 className="title left">Monthly Statistics</h5>
                <div className="header__input-group picker month right">
                  <Select
                    name="month-picker"
                    className="end-users-overview__month-picker left"
                    options={months}
                    value={this.state.selectedMonth}
                    clearable={false}
                    searchable={false}
                    onChange={this.monthlyStatsMonthChange}
                  />

                  <Select
                    name="year-picker"
                    className="end-users-overview__year-picker left"
                    options={years}
                    value={this.state.selectedYear}
                    clearable={false}
                    searchable={false}
                    onChange={this.monthlyStatsYearChange}
                  />
                </div>
              </div>
              <div className={classNames('body', 'end-users-overview__summary', {error: this.state.attemptsError || this.state.pastAttemptsError})}>
                <section className={classNames(`large-12`, 'columns')}>
                  <div className="end-users-overview__title">New Registered User</div>
                  <div className="end-users-overview__value">{monthlyRegisteredUserStats.total}</div>
                  <div className={classNames('end-users-overview__changes',
                    monthlyRegisteredUserStats.color, monthlyRegisteredUserStats.direction, { hide: !monthlyRegisteredUserStats.color })}>
                    <span className="arrow"></span>
                    <span>{monthlyRegisteredUserStats.change}</span>
                    <span>{`(${monthlyRegisteredUserStats.percent}%)`}</span>
                  </div>
                </section>
                <section className={classNames(`large-12`, 'columns', 'left-border' )}>
                  <div className="end-users-overview__title">Active User</div>
                  <div className="end-users-overview__value">{monthlyActiveUserStats.total}</div>
                  <div className={classNames('end-users-overview__changes',
                  monthlyActiveUserStats.color, monthlyActiveUserStats.direction, { hide: !monthlyActiveUserStats.color })}>
                    <span className="arrow"></span>
                    <span>{monthlyActiveUserStats.change}</span>
                    <span>{`(${monthlyActiveUserStats.percent}%)`}</span>
                  </div>
                </section>
              </div>
            </Panel.Wrapper>
          </div>
        </div>
      </div>
    );
  }
});

export default EndUsersOverview;
