import React, { PropTypes, Component } from 'react';
import moment from 'moment';
import connectToStores from 'fluxible-addons-react/connectToStores';

import VsfSummaryStats from '../components/overview/VsfSummaryStats';
import { clearVsfSummaryStats, fetchVsfSummaryStats } from '../actions/vsfStatsActions';
import VsfSummaryStatsStore from '../stores/VsfSummaryStatsStore';
import { parseTimeRange } from '../../../utils/timeFormatter';
import { LAST_UPDATE_TIME_FORMAT } from '../../../utils/timeFormatter';

class VsfSummaryStatsContainer extends Component {
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
      <VsfSummaryStats
        lastUpdate={::this.getLastUpdateMessage()}
        onChange={::this.onChange}
        isLoading={isLoading}
        timeFrame={timeFrame}
        stats={stats}
      />
    );
  }
}

VsfSummaryStatsContainer.contextTypes = {
  executeAction: PropTypes.func.isRequired,
  params: PropTypes.object.isRequired,
};

VsfSummaryStatsContainer.propTypes = {
  stats: PropTypes.object.isRequired,
  timeFrame: PropTypes.string.isRequired,
  isLoading: PropTypes.bool.isRequired,
};

export default connectToStores(
  VsfSummaryStatsContainer,
  [VsfSummaryStatsStore],
  ({ getStore }) => ({
    stats: getStore(VsfSummaryStatsStore).getState().stats,
    isLoading: getStore(VsfSummaryStatsStore).getState().isLoading,
    timeFrame: getStore(VsfSummaryStatsStore).getState().timeFrame,
  })
);
