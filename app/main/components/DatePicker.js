import moment from 'moment';
import React, { PropTypes } from 'react';
import ReactDatePicker from 'react-datepicker';
import classNames from 'classnames';

// TODO verify and extend the compatibility of `selectDate` DateFormat input
// this component assume users will always input/output date with same format

const DatePicker = React.createClass({
  propTypes: {
    withIcon: PropTypes.bool,
    type: PropTypes.string,
    selectedDate: PropTypes.string,
    minDate: PropTypes.string,
    maxDate: PropTypes.string,
    dateFormat: PropTypes.string,
    onChange: PropTypes.func.isRequired,
  },

  getDefaultProps() {
    const defaultDateFormat = 'L';

    return {
      withIcon: false,
      type: 'input',
      selectedDate: moment().format(defaultDateFormat),
      minDate: null,
      maxDate: null,
      dateFormat: defaultDateFormat,
      onChange: null,
    };
  },

  _handleFocus() {
    this
      .refs
      .datepicker
      .handleFocus();
  },

  render() {
    return (
      <div className={
        classNames(
          'date-picker',
          { 'date-picker-button': this.props.type === 'button' },
          'left'
        )}
      >
        <div onClick={this._handleFocus} className={
          classNames(
            'date-input-wrap',
            'left',
            { 'data-input-button-wrap': this.props.type === 'button' }
          )}
        >
          <If condition={this.props.type === 'button'}>
            <span className="date-range-picker__icon icon-calendar left"></span>
          </If>
          <If condition={this.props.type === 'button' || this.props.type === 'range'}>
            <span className="date-range-picker__date-text left">{this.props.selectedDate}</span>
          </If>
          <ReactDatePicker
            ref="datepicker"
            key="start-date"
            dateFormat={moment.localeData().longDateFormat(this.props.dateFormat)}
            selected={moment(this.props.selectedDate, this.props.dateFormat)}
            minDate={this.props.minDate}
            maxDate={moment(this.props.maxDate, this.props.dateFormat)}
            onChange={this.props.onChange}
          />
        </div>
      </div>
    );
  },
});

export default DatePicker;
