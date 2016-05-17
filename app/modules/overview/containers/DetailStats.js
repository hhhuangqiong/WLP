import { get, reduce } from 'lodash';
import moment from 'moment';
import React, { PropTypes, Component } from 'react';
import connectToStores from 'fluxible-addons-react/connectToStores';

import {
  clearOverviewDetailStats,
  fetchOverviewDetailStats,
} from '../actions/stats';

import {
  LAST_UPDATE_TIME_FORMAT,
  HOUR_FORMAT_LABEL,
  } from '../../../utils/timeFormatter';

import DetailStats from '../components/DetailStats';
import DetailStatsStore from '../stores/detailStats';

const PLATFORM_BREAKDOWN = 'platform';

class DetailStatsContainer extends Component {
  constructor(props) {
    super(props);

    this.executeFetch = this.executeFetch.bind(this);
  }

  componentDidMount() {
    this.executeFetch();
  }

  componentWillUnmount() {
    this.context.executeAction(clearOverviewDetailStats);
  }

  executeFetch() {
    const time = this.getLastUpdate();
    const from = moment(time, LAST_UPDATE_TIME_FORMAT).subtract(1, 'day').format('x');
    const to = moment(time, LAST_UPDATE_TIME_FORMAT).format('x');
    const timescale = 'day';
    const { identity: carrierId } = this.context.params;
    const breakdown = PLATFORM_BREAKDOWN;

    this.context.executeAction(fetchOverviewDetailStats, {
      from,
      to,
      timescale,
      carrierId,
      breakdown,
    });
  }

  getLastUpdate() {
    // Since the API of gettig verified user will update every hour
    // The last update time is set to fetch last hour data to ensure the alignment with the API
    return moment()
      .subtract(1, HOUR_FORMAT_LABEL)
      .endOf(HOUR_FORMAT_LABEL)
      .format(LAST_UPDATE_TIME_FORMAT);
  }

  parseGeographicChartData(stats) {
    return reduce(stats, (result, value, countryCode) => {
      result.push({
        code: countryCode && countryCode.toUpperCase(),
        value,
      });
      return result;
    }, []);
  }

  render() {
    const {
      stats,
      isLoading,
    } = this.props;

    const geographicChartData = this.parseGeographicChartData(get(stats, 'countryData'));

    return (
      <DetailStats
        lastUpdate={this.getLastUpdate()}
        isLoading={isLoading}
        geographicChartData={geographicChartData}
      />
    );
  }
}

DetailStatsContainer.contextTypes = {
  executeAction: PropTypes.func.isRequired,
  params: PropTypes.object.isRequired,
};

DetailStatsContainer.propTypes = {
  stats: PropTypes.object.isRequired,
  isLoading: PropTypes.bool.isRequired,
};

export default connectToStores(
  DetailStatsContainer,
  [DetailStatsStore],
  ({ getStore }) => ({
    stats: getStore(DetailStatsStore).getState().stats,
    isLoading: getStore(DetailStatsStore).getState().isLoading,
  })
);
