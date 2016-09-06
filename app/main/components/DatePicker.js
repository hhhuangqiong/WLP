import moment from 'moment';
import React, { PropTypes } from 'react';
import ReactDatePicker from 'react-datepicker';
import classNames from 'classnames';
import Icon from '../components/Icon';
import * as dateLocale from '../../utils/dateLocale';

// TODO verify and extend the compatibility of `selectDate` DateFormat input
// this component assume users will always input/output date with same format

const DatePicker = React.createClass({
  propTypes: {
    withIcon: PropTypes.bool,
    type: PropTypes.string,
    // moment object
    selectedDate: PropTypes.object,
    minDate: PropTypes.object,
    maxDate: PropTypes.object,
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
    const lang = dateLocale.getLocale();
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
            <Icon className="date-range-picker__icon left" symbol="icon-calendar" />
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
            locale={lang}
          />
        </div>
      </div>
    );
  },
});

export default DatePicker;
