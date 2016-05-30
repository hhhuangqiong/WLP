import moment from 'moment';
import React, { PropTypes, Component } from 'react';
import { connectToStores } from 'fluxible-addons-react';
import MonthlyStats from '../components/MonthlyStats';
import MonthlyStatsStore from '../stores/MonthlyStats';
import changeSelectedDate from '../actions/changeSelectedDate';
import fetchMonthlyStats from '../actions/fetchMonthlyStats';
import clearMonthlyStatsStore from '../actions/clearMonthlyStatsStore';

class Container extends Component {
  constructor(props) {
    super(props);

    this._fetchData = this._fetchData.bind(this);
    this._handleSelectedDateChange = this._handleSelectedDateChange.bind(this);
  }

  componentDidMount() {
    this._fetchData();
  }

  componentDidUpdate(prevProps) {
    const {
      selectedMonth: prevSelectedMonth,
      selectedYear: prevSelectedYear,
    } = prevProps;

    const { selectedMonth, selectedYear } = this.props;

    if (selectedMonth !== prevSelectedMonth || selectedYear !== prevSelectedYear) {
      this._fetchData();
    }
  }

  componentWillUnmount() {
    this.context.executeAction(clearMonthlyStatsStore);
  }

  _handleSelectedDateChange(date) {
    this.context.executeAction(changeSelectedDate, date);
  }

  _fetchData() {
    const { params: { identity } } = this.context;
    const { selectedMonth, selectedYear } = this.props;
    const selectedDate = moment({ year: selectedYear, month: selectedMonth });
    const fromTime = selectedDate.startOf('month').format('x');
    const toTime = selectedDate.endOf('month').format('x');
    const query = {
      identity,
      fromTime,
      toTime,
    };

    this.context.executeAction(fetchMonthlyStats, query);
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

  _parseSelectedDate(month, year) {
    return moment({ year, month }).format('L');
  }

  render() {
    const {
      isLoading,
      data,
      selectedMonth,
      selectedYear,
    } = this.props;

    return (
      <MonthlyStats
        isLoading={isLoading}
        data={this._parseData(data)}
        selectedDate={this._parseSelectedDate(selectedMonth, selectedYear)}
        onSelectedDateChange={this._handleSelectedDateChange}
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
    value: PropTypes.number,
    change: PropTypes.number,
  }),
  selectedMonth: PropTypes.number,
  selectedYear: PropTypes.number,
};

Container = connectToStores(
  Container,
  [MonthlyStatsStore],
  context => ({
    isLoading: context.getStore(MonthlyStatsStore).getIsLoading(),
    data: context.getStore(MonthlyStatsStore).getData(),
    selectedMonth: context.getStore(MonthlyStatsStore).getSelectedMonth(),
    selectedYear: context.getStore(MonthlyStatsStore).getSelectedYear(),
  })
);

export default Container;
