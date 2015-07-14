import React from 'react';
import Moment from 'moment';

import DatePicker from 'react-datepicker';

let DateRangePicker = React.createClass({
  propTypes: {
    displayFormat: React.PropTypes.string,
    startDate: React.PropTypes.string,
    endDate: React.PropTypes.string,
    handleStartDateChange: React.PropTypes.func,
    handleEndDateChange: React.PropTypes.func
  },

  handleStartDateClick() {
    this.refs.startDatePicker.handleFocus();
  },

  handleEndDateClick() {
    this.refs.endDatePicker.handleFocus();
  },

  render() {
    return (
      <div className="date-range-picker left">
        <i className="date-range-picker__icon icon-calendar left" />
        <div className="date-input-wrap left" onClick={this.handleStartDateClick}>
          <span className="left date-range-picker__date-span">{this.props.startDate}</span>
          <DatePicker
            ref="startDatePicker"
            key="start-date"
            dateFormat={this.props.displayFormat}
            selected={Moment(this.props.startDate, 'L')}
            maxDate={Moment(this.props.endDate, 'L')}
            onChange={this.props.handleStartDateChange}
          />
        </div>
        <i className="date-range-picker__separator left">-</i>
        <div className="date-input-wrap left" onClick={this.handleEndDateClick}>
          <span className="left date-range-picker__date-span">{this.props.endDate}</span>
          <DatePicker
            ref="endDatePicker"
            key="end-date"
            dateFormat={this.props.displayFormat}
            selected={Moment(this.props.endDate, 'L')}
            minDate={Moment(this.props.startDate, 'L')}
            maxDate={Moment()}
            onChange={this.props.handleEndDateChange}
          />
        </div>
      </div>
    );
  }
});

export default DateRangePicker;
