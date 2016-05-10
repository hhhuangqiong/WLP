import React, { PropTypes, Component } from 'react';
import moment from 'moment';
import connectToStores from 'fluxible-addons-react/connectToStores';

import {
  updateSmsSummaryStatsTimeFrame,
  clearSmsSummaryStats,
  fetchSmsSummaryStats,
} from '../actions/stats';

import SummaryStats from '../components/overview/SummaryStats';
import summaryStatsStore from '../stores/summaryStats';
import { parseTimeRange } from '../../../utils/timeFormatter';

import {
  LAST_UPDATE_TIME_FORMAT,
  HOUR_FORMAT_LABEL,
} from '../../../utils/timeFormatter';

class SummaryStatsContainer extends Component {
  constructor(props) {
    super(props);
    this.getLastUpdate = this.getLastUpdate.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  componentDidMount() {
    const { timeFrame } = this.props;
    this.executeFetch(timeFrame);
  }

  componentDidUpdate({ timeFrame }) {
    if (timeFrame !== this.props.timeFrame) {
      this.executeFetch(this.props.timeFrame);
    }
  }

  componentWillUnmount() {
    this.context.executeAction(clearSmsSummaryStats);
  }

  onChange(timeFrame) {
    this.context.executeAction(updateSmsSummaryStatsTimeFrame, {
      timeFrame,
    });
  }

  getLastUpdate() {
    const { to, timescale } = parseTimeRange(this.props.timeFrame);
    const lastUpdate =
      timescale === HOUR_FORMAT_LABEL ?
        moment(to).subtract(1, timescale) :
        moment(to);

    return lastUpdate.endOf(timescale).format(LAST_UPDATE_TIME_FORMAT);
  }

  executeFetch(timeFrame) {
    const { from, to, timescale } = parseTimeRange(timeFrame);
    const { identity: carrierId } = this.context.params;

    this.context.executeAction(fetchSmsSummaryStats, {
      from,
      to,
      timescale,
      carrierId,
      timeFrame,
    });
  }

  render() {
    const {
      stats,
      isLoading,
      timeFrame,
    } = this.props;

    return (
      <SummaryStats
        lastUpdate={this.getLastUpdate()}
        onChange={this.onChange}
        isLoading={isLoading}
        timeFrame={timeFrame}
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
  timeFrame: PropTypes.string.isRequired,
  isLoading: PropTypes.bool.isRequired,
};

export default connectToStores(
  SummaryStatsContainer,
  [summaryStatsStore],
  ({ getStore }) => ({
    stats: getStore(summaryStatsStore).getState().stats,
    isLoading: getStore(summaryStatsStore).getState().isLoading,
    timeFrame: getStore(summaryStatsStore).getState().timeFrame,
  })
);
