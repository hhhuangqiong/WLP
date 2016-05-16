import React, { Component, PropTypes } from 'react';
import moment from 'moment';
import connectToStores from 'fluxible-addons-react/connectToStores';

import {
  updateSmsMonthlyStatsDate,
  fetchSmsMonthlyStats,
  clearSmsMonthlyStats,
} from '../actions/stats';

import MonthlyStats from '../components/MonthlyStats';
import monthlyStatsStore from '../stores/monthlyStats';

import {
  SHORT_DATE_FORMAT,
  MILLISECOND_DATE_FORMAT,
  MONTH_FORMAT_LABLE,
} from '../../../utils/timeFormatter';

class MonthlyStatsContainer extends Component {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }

  componentDidMount() {
    const { date } = this.props;
    this.executeFetch(date);
  }

  componentDidUpdate({ date }) {
    if (date !== this.props.date) {
      this.executeFetch(this.props.date);
    }
  }

  componentWillUnmount() {
    this.context.executeAction(clearSmsMonthlyStats);
  }

  onChange(date) {
    this.context.executeAction(updateSmsMonthlyStatsDate, date);
  }

  executeFetch(date) {
    const { identity } = this.context.params;

    const from = moment(date, SHORT_DATE_FORMAT)
      .startOf(MONTH_FORMAT_LABLE)
      .format(MILLISECOND_DATE_FORMAT);

    const to = moment(date, SHORT_DATE_FORMAT)
      .endOf(MONTH_FORMAT_LABLE)
      .format(MILLISECOND_DATE_FORMAT);

    this.context.executeAction(fetchSmsMonthlyStats, {
      fromTime: from,
      toTime: to,
      identity,
    });
  }

  parseData(data) {
    if (!data) {
      return data;
    }

    const { value, oldValue, change } = data;
    const percentageChange = (change / oldValue) * 100;

    // TODO: standardize the data structure
    return {
      value,
      change: {
        value: change,
        direction: change > 0 ? 'up' : 'down',
        effect: 'positive',
        percentage: percentageChange,
      },
    };
  }

  render() {
    const {
      stats,
      date,
      isLoading,
    } = this.props;

    return (
      <MonthlyStats
        isLoading={isLoading}
        onChange={this.onChange}
        date={date}
        stats={this.parseData(stats)}
      />
    );
  }
}

MonthlyStatsContainer.contextTypes = {
  executeAction: PropTypes.func.isRequired,
  params: PropTypes.object.isRequired,
};

MonthlyStatsContainer.propTypes = {
  stats: PropTypes.shape({
    value: PropTypes.number,
    oldValue: PropTypes.number,
    change: PropTypes.number,
  }),
  date: PropTypes.string.isRequired,
  isLoading: PropTypes.bool.isRequired,
};

export default connectToStores(
  MonthlyStatsContainer,
  [monthlyStatsStore],
  ({ getStore }) => ({
    stats: getStore(monthlyStatsStore).getState().stats,
    date: getStore(monthlyStatsStore).getState().date,
    isLoading: getStore(monthlyStatsStore).getState().isLoading,
  })
);
