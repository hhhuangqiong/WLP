import React, { PropTypes, Component } from 'react';
import moment from 'moment';
import connectToStores from 'fluxible-addons-react/connectToStores';

import SummaryStats from '../components/overview/SummaryStats';
import { clearVsfSummaryStats, fetchVsfSummaryStats } from '../actions/stats';
import SummaryStatsStore from '../stores/summaryStats';
import { parseTimeRange } from '../../../utils/timeFormatter';
import { LAST_UPDATE_TIME_FORMAT } from '../../../utils/timeFormatter';

class SummaryStatsContainer extends Component {
  componentDidMount() {
    const { timeFrame } = this.props;

    const { from, to, timescale } = parseTimeRange(timeFrame);
    const { identity: carrierId } = this.context.params;

    this.context.executeAction(fetchVsfSummaryStats, {
      from,
      to,
      timescale,
      carrierId,
      timeFrame,
    });
  }

  componentWillUnmount() {
    this.context.executeAction(clearVsfSummaryStats);
  }

  onChange(timeFrame) {
    if (timeFrame === this.props.timeFrame) {
      return;
    }

    const { from, to, timescale } = parseTimeRange(timeFrame);
    const { identity: carrierId } = this.context.params;

    this.context.executeAction(fetchVsfSummaryStats, {
      from,
      to,
      timescale,
      carrierId,
      timeFrame,
    });
  }

  getLastUpdateMessage() {
    const { to, timescale } = parseTimeRange(this.props.timeFrame);
    const lastUpdate = timescale === 'hour' ? moment(to).subtract(1, timescale) : moment(to);

    return lastUpdate.endOf(timescale).format(LAST_UPDATE_TIME_FORMAT);
  }

  render() {
    const {
      stats,
      isLoading,
      timeFrame,
    } = this.props;

    return (
      <SummaryStats
        lastUpdate={::this.getLastUpdateMessage()}
        onChange={::this.onChange}
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
  [SummaryStatsStore],
  ({ getStore }) => ({
    stats: getStore(SummaryStatsStore).getState().stats,
    isLoading: getStore(SummaryStatsStore).getState().isLoading,
    timeFrame: getStore(SummaryStatsStore).getState().timeFrame,
  })
);
