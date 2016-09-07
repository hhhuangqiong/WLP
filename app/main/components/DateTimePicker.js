import moment from 'moment';

import React, { PropTypes } from 'react';
import classnames from 'classnames';
import DatePicker from 'react-datepicker';
import Icon from '../components/Icon';

import TimePicker from './TimePicker';
import * as dateLocale from '../../utils/dateLocale';

export default React.createClass({
  propTypes: {
    name: PropTypes.string,
    // moment object
    date: PropTypes.object,
    minDate: PropTypes.object,
    dataPickerkey: PropTypes.string,
    dataPickerRef: PropTypes.string,
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
        <Icon className="date-range-picker__icon left" symbol="icon-calendar" />

        <div className="date-input-wrap left" onClick={this._handleFocus}>
          <span className="interactive-button left date-range-picker__date-span">{date.format('L')}</span>

          <DatePicker
            ref={dataPickerRef}
            key={dataPickerkey}
            dateFormat={dateFormat}
            selected={date}
            onChange={dateOnChange}
            minDate={minDate}
            maxDate={moment()}
            locale={dateLocale.getLocale()}
          />
        </div>

        <span className="date-range-picker__separator left">
          &nbsp;&nbsp;|&nbsp;&nbsp;
        </span>

        <Icon className="date-range-picker__icon left" symbol="icon-clock" />

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
