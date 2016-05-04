import React, { Component, PropTypes } from 'react';
import moment from 'moment';
import connectToStores from 'fluxible-addons-react/connectToStores';

import { fetchVsfMonthlyStats, clearVsfMonthlyStats } from '../actions/vsfStatsActions';
import VsfMonthlyStats from '../components/overview/VsfMonthlyStats';
import VsfMonthlyStatsStore from '../stores/VsfMonthlyStatsStore';
import { LAST_UPDATE_TIME_FORMAT } from '../../../utils/timeFormatter';

class VsfMonthlyStatsContainer extends Component {
  componentWillUnmount() {
    this.context.executeAction(clearVsfMonthlyStats);
  }

  onChange(date) {
    const { identity: carrierId } = this.context.params;

    this.context.executeAction(fetchVsfMonthlyStats, {
      date,
      carrierId,
    });
  }

  getLastUpdateMessage() {
    return moment(this.props.date, 'L').endOf('month').format(LAST_UPDATE_TIME_FORMAT);
  }

  render() {
    const {
      stats,
      date,
      isLoading,
    } = this.props;

    return (
      <VsfMonthlyStats
        lastUpdate={::this.getLastUpdateMessage()}
        isLoading={isLoading}
        onChange={::this.onChange}
        date={date}
        stats={stats}
      />
    );
  }
}

VsfMonthlyStatsContainer.contextTypes = {
  executeAction: PropTypes.func.isRequired,
  params: PropTypes.object.isRequired,
};

VsfMonthlyStatsContainer.propTypes = {
  stats: PropTypes.array.isRequired,
  date: PropTypes.string.isRequired,
  isLoading: PropTypes.bool.isRequired,
};

export default connectToStores(
  VsfMonthlyStatsContainer,
  [VsfMonthlyStatsStore],
  ({ getStore }) => ({
    stats: getStore(VsfMonthlyStatsStore).getState().stats,
    date: getStore(VsfMonthlyStatsStore).getState().date,
    isLoading: getStore(VsfMonthlyStatsStore).getState().isLoading,
  })
);
