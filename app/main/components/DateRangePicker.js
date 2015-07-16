import moment from 'moment';
import React, {PropTypes} from 'react';
import DatePicker from './DatePicker';

let DateRangePicker = React.createClass({
  propTypes: {
    withIcon: PropTypes.bool,
    startDate: PropTypes.string,
    endDate: PropTypes.string,
    dateFormat: PropTypes.string,
    handleStartDateChange: PropTypes.func.isRequired,
    handleEndDateChange: PropTypes.func.isRequired
  },

  getDefaultProps: function() {
    return {
      withIcon: false,
      startDate: null,
      endDate: null,
      dateFormat: 'L',
      handleStartDateChange: null,
      handleEndDateChange: null
    }
  },

  render: function() {
    return (
      <div className="date-picker date-range-picker left">
        <If condition={this.props.withIcon === true}>
          <i className="date-range-picker__icon icon-calendar left" />
        </If>
        <DatePicker type="range" selectedDate={this.props.startDate} maxDate={this.props.endDate} dateFormat={this.props.dateFormat} onChange={this.props.handleStartDateChange} />
        <i className="date-range-picker__separator left">-</i>
        <DatePicker type="range" selectedDate={this.props.endDate} minDate={this.props.startDate} dateFormat={this.props.dateFormat} onChange={this.props.handleEndDateChange} />
      </div>
    );
  }
});

export default DateRangePicker;
