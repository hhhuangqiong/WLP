import moment from 'moment';
import React, { Component, PropTypes } from 'react';
import DateSelectorGrid from './DateSelectorGrid';

export default class DateSelector extends Component {
  static propTypes = {
    date: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    dateRange: PropTypes.string,
    monthFormat: PropTypes.string,
    yearFormat: PropTypes.string,
    monthOptions: PropTypes.array,
    yearOptions: PropTypes.array,
  };

  static defaultProps = {
    monthFormat: 'MMMM',
    yearFormat: 'YYYY',
    dateRange: '1 years',
    monthOptions: [],
    yearOptions: [],
  };

  getMinDate() {
    const dateParts = this.props.dateRange.split(' ');
    return moment().subtract(dateParts[0], dateParts[1]).startOf('day').format('L');
  }

  render() {
    return (
      <div className="date-selector">
        <div className="date-selector__item">
          <DateSelectorGrid
            date={this.props.date}
            minDate={this.getMinDate()}
            displayFormat={this.props.monthFormat}
            timescale="months"
            options={this.props.monthOptions}
            onChange={this.props.onChange}
          />
        </div>
        <div className="date-selector__item">
          <DateSelectorGrid
            date={this.props.date}
            minDate={this.getMinDate()}
            displayFormat={this.props.yearFormat}
            timescale="years"
            options={this.props.yearOptions}
            onChange={this.props.onChange}
          />
        </div>
      </div>
    );
  }
}
