import React, { Component, PropTypes } from 'react';
import moment from 'moment';
import connectToStores from 'fluxible-addons-react/connectToStores';

import {
  updateVsfMonthlyStatsDate,
  fetchVsfMonthlyStats,
  clearVsfMonthlyStats,
} from '../actions/stats';

import MonthlyStats from '../components/overview/MonthlyStats';
import MonthlyStatsStore from '../stores/monthlyStats';

import {
  SHORT_DATE_FORMAT,
  LAST_UPDATE_TIME_FORMAT,
  MILLISECOND_DATE_FORMAT,
  MONTH_FORMAT_LABLE,
} from '../../../utils/timeFormatter';

class MonthlyStatsContainer extends Component {
  constructor(props) {
    super(props);

    this.onChange = this.onChange.bind(this);
    this.executeFetch = this.executeFetch.bind(this);
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
    this.context.executeAction(clearVsfMonthlyStats);
  }

  onChange(date) {
    this.context.executeAction(updateVsfMonthlyStatsDate, {
      date,
    });
  }

  executeFetch(date) {
    const { identity: carrierId } = this.context.params;

    const from = moment(date, SHORT_DATE_FORMAT)
      .startOf(MONTH_FORMAT_LABLE)
      .format(MILLISECOND_DATE_FORMAT);

    const to = moment(date, SHORT_DATE_FORMAT)
      .endOf(MONTH_FORMAT_LABLE)
      .format(MILLISECOND_DATE_FORMAT);

    this.context.executeAction(fetchVsfMonthlyStats, {
      from,
      to,
      carrierId,
    });
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
        stats={stats}
      />
    );
  }
}

MonthlyStatsContainer.contextTypes = {
  executeAction: PropTypes.func.isRequired,
  params: PropTypes.object.isRequired,
};

MonthlyStatsContainer.propTypes = {
  stats: PropTypes.array.isRequired,
  date: PropTypes.string.isRequired,
  isLoading: PropTypes.bool.isRequired,
};

export default connectToStores(
  MonthlyStatsContainer,
  [MonthlyStatsStore],
  ({ getStore }) => ({
    stats: getStore(MonthlyStatsStore).getState().stats,
    date: getStore(MonthlyStatsStore).getState().date,
    isLoading: getStore(MonthlyStatsStore).getState().isLoading,
  })
);
