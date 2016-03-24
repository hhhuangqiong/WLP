import moment from 'moment';

import React, { PropTypes } from 'react';
import classnames from 'classnames';
import DatePicker from 'react-datepicker';

import TimePicker from './TimePicker';

export default React.createClass({
  propTypes: {
    name: PropTypes.string,
    date: PropTypes.string,
    dataPickerkey: PropTypes.string,
    dataPickerRef: PropTypes.string,
    minDate: PropTypes.string,
    dateFormat: PropTypes.string,
    timeFormat: PropTypes.string,
    className: PropTypes.string,
    dateOnChange: PropTypes.func.isRequired,
  },

  _handleFocus() {
    this
      .refs[this.props.dataPickerRef]
      .handleFocus();
  },

  render() {
    const {
      name,
      date,
      dataPickerkey,
      dataPickerRef,
      minDate,
      dateFormat,
      timeFormat,
      className,
      dateOnChange,
    } = this.props;

    return (
      <div className={classnames('date-range-picker', className)}>
        <i className="date-range-picker__icon icon-calendar left" />

        <div className="date-input-wrap left" onClick={this._handleFocus}>
          <span className="left date-range-picker__date-span">{date.format('L')}</span>

          <DatePicker
            ref={dataPickerRef}
            key={dataPickerkey}
            dateFormat={dateFormat}
            selected={date}
            onChange={dateOnChange}
            minDate={minDate}
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
          minDate={minDate}
          className="date-input-wrap left"
          onChange={dateOnChange}
        />
      </div>
    );
  },
});
