import { reduce } from 'lodash';
import React, { PropTypes, Component } from 'react';
import connectToStores from 'fluxible-addons-react/connectToStores';

import {
  updateVsfSummaryStatsTimeFrame,
  clearVsfSummaryStats,
  fetchVsfSummaryStats,
} from '../actions/stats';

import SummaryStats from '../components/overview/SummaryStats';
import SummaryStatsStore from '../stores/summaryStats';
import { parseTimeRange } from '../../../utils/timeFormatter';

class SummaryStatsContainer extends Component {
  constructor(props) {
    super(props);

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

  parseLineChartData(data) {
    return {
      // eslint-disable-next-line no-return-assign,no-param-reassign
      sum: reduce(data, (total, { v }) => total += +v, 0),
      breakdown: reduce(data, (breakdown, { v }) => { breakdown.push(v); return breakdown; }, []),
    };
  }

  render() {
    const {
      stats,
      isLoading,
      timeFrame,
    } = this.props;

    return (
      <SummaryStats
        onChange={this.onChange}
        isLoading={isLoading}
        timeFrame={timeFrame}
        stats={stats}
        lineChartData={this.parseLineChartData(stats.lineChartData)}
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
