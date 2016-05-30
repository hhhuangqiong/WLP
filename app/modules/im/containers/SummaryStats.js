import { get, pick, reduce } from 'lodash';
import moment from 'moment';
import React, { PropTypes, Component } from 'react';
import { connectToStores } from 'fluxible-addons-react';
import { parseTimeRange } from '../../../utils/timeFormatter';
import SummaryStats from '../components/SummaryStats';
import SummaryStatsStore from '../stores/SummaryStats';
import changeSelectedTimeFrame from '../actions/changeSelectedTimeFrame';
import fetchSummaryStats from '../actions/fetchSummaryStats';
import clearSummaryStatsStore from '../actions/clearSummaryStatsStore';
import { SUMMARY_TYPES } from '../constants/index';

class Container extends Component {
  constructor(props) {
    super(props);

    this._fetchData = this._fetchData.bind(this);
    this._handleSelectedTimeFrameChange = this._handleSelectedTimeFrameChange.bind(this);
  }

  componentDidMount() {
    this._fetchData();
  }

  componentDidUpdate(prevProps) {
    const {
      selectedTimeFrame: prevSelectedTimeFrame,
    } = prevProps;

    const { selectedTimeFrame } = this.props;

    if (selectedTimeFrame !== prevSelectedTimeFrame) {
      this._fetchData();
    }
  }

  componentWillUnmount() {
    this.context.executeAction(clearSummaryStatsStore);
  }

  _handleSelectedTimeFrameChange(timeframe) {
    this.context.executeAction(changeSelectedTimeFrame, timeframe);
  }

  _fetchData() {
    const { params: { identity } } = this.context;
    const { selectedTimeFrame } = this.props;
    const { from, to, timescale } = parseTimeRange(selectedTimeFrame);
    const query = {
      identity,
      from,
      to,
      timescale,
    };

    this.context.executeAction(fetchSummaryStats, query);
  }

  // TODO: make it as a util/helper
  _parseData(data) {
    if (!data) {
      return data;
    }

    const { value, oldValue, change } = data;
    const percentageChange = (change / oldValue) * 100;

    let direction;

    if (change > 0) {
      direction = 'up';
    } else if (change < 0) {
      direction = 'down';
    } else {
      direction = 'flat';
    }

    // TODO: standardize the data structure
    return {
      value,
      change: {
        value: change,
        direction,
        effect: 'positive',
        percentage: percentageChange,
      },
    };
  }

  _parseLineChartData(data) {
    return {
      // eslint-disable-next-line no-return-assign,no-param-reassign
      sum: reduce(data, (total, { v }) => total += +v, 0),
      breakdown: reduce(data, (breakdown, { v }) => { breakdown.push(v); return breakdown; }, []),
    };
  }

  _parseSelectedDate(month, year) {
    return moment({ year, month }).format('L');
  }

  render() {
    const {
      isLoading,
      data,
      selectedTimeFrame,
    } = this.props;

    const summaryData = reduce(pick(data, SUMMARY_TYPES), (result, value, key) => {
      // eslint-disable-next-line no-param-reassign
      result[key] = this._parseData(value);
      return result;
    }, {});
    const lineChartData = get(data, 'total');

    return (
      <SummaryStats
        isLoading={isLoading}
        summaryData={summaryData}
        lineChartData={this._parseLineChartData(lineChartData)}
        selectedTimeFrame={selectedTimeFrame}
        onSelectedTimeFrameChange={this._handleSelectedTimeFrameChange}
      />
    );
  }
}

Container.contextTypes = {
  executeAction: PropTypes.func,
  params: PropTypes.object,
};

Container.propTypes = {
  isLoading: PropTypes.bool,
  data: PropTypes.shape({
    total: PropTypes.object,
    text: PropTypes.object,
    image: PropTypes.object,
    video: PropTypes.object,
    audio: PropTypes.object,
    multi: PropTypes.object,
    sharing: PropTypes.object,
  }),
  selectedTimeFrame: PropTypes.string,
};

Container = connectToStores(
  Container,
  [SummaryStatsStore],
  context => ({
    isLoading: context.getStore(SummaryStatsStore).getIsLoading(),
    data: context.getStore(SummaryStatsStore).getData(),
    selectedTimeFrame: context.getStore(SummaryStatsStore).getSelectedTimeFrame(),
  })
);

export default Container;
