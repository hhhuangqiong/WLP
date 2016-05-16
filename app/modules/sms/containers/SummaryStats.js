import { get, pick, reduce } from 'lodash';
import React, { PropTypes, Component } from 'react';
import connectToStores from 'fluxible-addons-react/connectToStores';

import {
  updateSmsSummaryStatsTimeFrame,
  clearSmsSummaryStats,
  fetchSmsSummaryStats,
} from '../actions/stats';

import SummaryStats from '../components/SummaryStats';
import summaryStatsStore from '../stores/summaryStats';
import { SUMMARY_TYPES } from '../constants/index';
import { parseTimeRange } from '../../../utils/timeFormatter';

class SummaryStatsContainer extends Component {
  constructor(props) {
    super(props);
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
    this.context.executeAction(updateSmsSummaryStatsTimeFrame, timeFrame);
  }

  executeFetch(timeFrame) {
    const { from, to, timescale } = parseTimeRange(timeFrame);
    const { identity } = this.context.params;

    this.context.executeAction(fetchSmsSummaryStats, {
      from,
      to,
      timescale,
      identity,
      timeFrame,
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

  parseLineChartData(data) {
    return {
      // eslint-disable-next-line no-return-assign,no-param-reassign
      sum: reduce(data, (total, { v }) => total += +v, 0),
      breakdown: reduce(data, (breakdown, { v }) => { breakdown.push(v); return breakdown; }, []),
    };
  }

  parseGeographicChartData(stats) {
    const dataTotal = reduce(stats, (result, data, countryCode) => {
      // eslint-disable-next-line no-param-reassign,no-return-assign
      const subtotal = reduce(data, (total, { v }) => total += +v, 0);
      result.push({
        code: countryCode,
        value: subtotal,
      });
      return result;
    }, []);

    return dataTotal;
  }

  render() {
    const {
      stats,
      isLoading,
      timeFrame,
    } = this.props;

    const summaryData = reduce(pick(stats, SUMMARY_TYPES), (result, value, key) => {
      // eslint-disable-next-line no-param-reassign
      result[key] = this.parseData(value);
      return result;
    }, {});

    const lineChartData = this.parseLineChartData(get(stats, 'lineChart'));
    const geographicChartData = this.parseGeographicChartData(get(stats, 'geographicChart'));

    return (
      <SummaryStats
        onChange={this.onChange}
        isLoading={isLoading}
        timeFrame={timeFrame}
        summaryData={summaryData}
        lineChartData={lineChartData}
        geographicChartData={geographicChartData}
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
