import React, { PropTypes } from 'react';
import moment from 'moment';

import DatePicker from 'react-datepicker';
import Icon from '../components/Icon';

import * as dateLocale from '../../utils/dateLocale';

const DateRangePicker = React.createClass({
  propTypes: {
    displayFormat: PropTypes.string,
    startDate: PropTypes.string,
    endDate: PropTypes.string,
    handleStartDateChange: PropTypes.func,
    handleEndDateChange: PropTypes.func,
  },

  handleStartDateClick() {
    this
      .refs
      .startDatePicker
      .handleFocus();
  },

  handleEndDateClick() {
    this
      .refs
      .endDatePicker
      .handleFocus();
  },

  render() {
    const locale = dateLocale.getLocale();
    return (
      <div className="date-range-picker left">
        <Icon className="date-range-picker__icon left" symbol="icon-calendar" />
        <div className="date-range-picker__start date-input-wrap left" onClick={this.handleStartDateClick}>
          <span
            className="interactive-button left date-range-picker__date-span"
          >{this.props.startDate}</span>
          <DatePicker
            ref="startDatePicker"
            key="start-date"
            dateFormat={this.props.displayFormat}
            selected={moment(this.props.startDate, 'L')}
            maxDate={moment(this.props.endDate, 'L')}
            onChange={this.props.handleStartDateChange}
            locale={locale}
          />
        </div>
        <i className="date-range-picker__separator left">-</i>
        <div className="date-range-picker__end date-input-wrap left" onClick={this.handleEndDateClick}>
          <span
            className="interactive-button left date-range-picker__date-span"
          >{this.props.endDate}</span>
          <DatePicker
            ref="endDatePicker"
            key="end-date"
            dateFormat={this.props.displayFormat}
            selected={moment(this.props.endDate, 'L')}
            minDate={moment(this.props.startDate, 'L')}
            maxDate={moment()}
            onChange={this.props.handleEndDateChange}
            locale={locale}
          />
        </div>
      </div>
    );
  },
});

export default DateRangePicker;
