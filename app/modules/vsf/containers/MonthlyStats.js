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
import { LAST_UPDATE_TIME_FORMAT } from '../../../utils/timeFormatter';

class MonthlyStatsContainer extends Component {
  constructor(props) {
    super(props);
    this.executeFetch = this.executeFetch.bind(this);
  }

  componentDidMount() {
    const { date } = this.props.date;
    this.executeFetch(date);
  }

  shouldComponentUpdate({ date }) {
    return date !== this.props.date;
  }

  componentDidUpdate({ date }) {
    this.executeFetch(date);
  }

  componentWillUnmount() {
    this.context.executeAction(clearVsfMonthlyStats);
  }

  onChange(date) {
    this.context.executeAction(updateVsfMonthlyStatsDate, {
      date,
    });
  }

  getLastUpdateMessage() {
    return moment(this.props.date, 'L').endOf('month').format(LAST_UPDATE_TIME_FORMAT);
  }

  executeFetch(date) {
    const { identity: carrierId } = this.context.params;

    this.context.executeAction(fetchVsfMonthlyStats, {
      date,
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
        lastUpdate={::this.getLastUpdateMessage()}
        isLoading={isLoading}
        onChange={::this.onChange}
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
