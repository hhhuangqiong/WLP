import React from 'react';
import moment from 'moment';

import DatePicker from 'react-datepicker';
import TimePicker from './TimePicker';

let DateTimePicker = React.createClass({
  _handleFocus() {
    this.refs[this.props.dataPickerRef].handleFocus();
  },

  render() {
    let {
      name, date, dataPickerkey, dataPickerRef,
      minDate, maxDate, dateOnClick, dateOnChange,
      timeOnChange, dateFormat, timeFormat
    } = this.props

    return (
      <div className="date-range-picker export-datetime-picker">
        <i className="date-range-picker__icon icon-calendar left" />

        <div className="date-input-wrap left" onClick={this._handleFocus}>
          <span className="left date-range-picker__date-span">{date.format('L')}</span>

          <DatePicker
            ref={dataPickerRef}
            key={dataPickerkey}
            dateFormat={dateFormat}
            selected={date}
            onChange={dateOnChange}
            minDate={minDate ? moment(minDate) : ''}
            maxDate={moment()}
          />
        </div>

        <span className="date-range-picker__separator left">
          &nbsp;&nbsp;|&nbsp;&nbsp;
        </span>

        <i className="date-range-picker__icon icon-clock left" />

        <TimePicker
          timePickerId={name}
          datetime={date}
          format={timeFormat}
          className="date-input-wrap left"
          onChange={timeOnChange}
        />

      </div>
    )
  }
});

export default DateTimePicker;