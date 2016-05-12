import React, { PropTypes, Component } from 'react';
import moment from 'moment';
import connectToStores from 'fluxible-addons-react/connectToStores';

import {
  updateVsfSummaryStatsTimeFrame,
  clearVsfSummaryStats,
  fetchVsfSummaryStats,
} from '../actions/stats';

import {
  LAST_UPDATE_TIME_FORMAT,
  HOUR_FORMAT_LABEL,
} from '../../../utils/timeFormatter';

import SummaryStats from '../components/overview/SummaryStats';
import SummaryStatsStore from '../stores/summaryStats';
import { parseTimeRange } from '../../../utils/timeFormatter';

class SummaryStatsContainer extends Component {
  constructor(props) {
    super(props);
    this.getLastUpdate = this.getLastUpdate.bind(this);
    this.onChange = this.onChange.bind(this);
    this.executeFetch = this.executeFetch.bind(this);
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
    this.context.executeAction(clearVsfSummaryStats);
  }

  onChange(timeFrame) {
    this.context.executeAction(updateVsfSummaryStatsTimeFrame, {
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

    this.context.executeAction(fetchVsfSummaryStats, {
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
  [SummaryStatsStore],
  ({ getStore }) => ({
    stats: getStore(SummaryStatsStore).getState().stats,
    isLoading: getStore(SummaryStatsStore).getState().isLoading,
    timeFrame: getStore(SummaryStatsStore).getState().timeFrame,
  })
);
