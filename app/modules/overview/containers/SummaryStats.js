import React, { PropTypes, Component } from 'react';
import moment from 'moment';
import connectToStores from 'fluxible-addons-react/connectToStores';

import {
  clearOverviewSummaryStats,
  fetchOverviewSummaryStats,
} from '../actions/stats';

import {
  LAST_UPDATE_TIME_FORMAT,
  HOUR_FORMAT_LABEL,
} from '../../../utils/timeFormatter';

import SummaryStats from '../components/SummaryStats';
import SummaryStatsStore from '../stores/summaryStats';

const PLATFORM_BREAKDOWN = 'platform';

class SummaryStatsContainer extends Component {
  constructor(props) {
    super(props);

    this.executeFetch = this.executeFetch.bind(this);
  }

  componentDidMount() {
    this.executeFetch();
  }

  componentWillUnmount() {
    this.context.executeAction(clearOverviewSummaryStats);
  }

  getLastUpdate() {
    // Since the API of gettig verified user will update every hour
    // The last update time is set to fetch last hour data to ensure the alignment with the API
    return moment()
      .subtract(1, HOUR_FORMAT_LABEL)
      .endOf(HOUR_FORMAT_LABEL)
      .format(LAST_UPDATE_TIME_FORMAT);
  }

  executeFetch() {
    const time = this.getLastUpdate();
    const from = moment(time, LAST_UPDATE_TIME_FORMAT).subtract(1, 'day').format('x');
    const to = moment(time, LAST_UPDATE_TIME_FORMAT).format('x');
    const timescale = 'day';
    const { identity: carrierId } = this.context.params;
    const breakdown = PLATFORM_BREAKDOWN;

    this.context.executeAction(fetchOverviewSummaryStats, {
      from,
      to,
      timescale,
      carrierId,
      breakdown,
    });
  }

  render() {
    const {
      stats,
      isLoading,
    } = this.props;

    return (
      <SummaryStats
        isLoading={isLoading}
        stats={stats}
      />
    );
  }
}

SummaryStatsContainer.contextTypes = {
  executeAction: PropTypes.func.isRequired,
  params: PropTypes.object.isRequired,
};

SummaryStatsContainer.propTypes = {
  stats: PropTypes.object.isRequired,
  isLoading: PropTypes.bool.isRequired,
};

export default connectToStores(
  SummaryStatsContainer,
  [SummaryStatsStore],
  ({ getStore }) => ({
    stats: getStore(SummaryStatsStore).getState().stats,
    isLoading: getStore(SummaryStatsStore).getState().isLoading,
  })
);
