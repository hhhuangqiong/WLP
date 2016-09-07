import moment from 'moment';
import React, { Component, PropTypes } from 'react';
import * as dateLocale from '../../utils/dateLocale';

export default class DateSelectorLabel extends Component {
  static propTypes = {
    date: PropTypes.string.isRequired,
    minDate: PropTypes.string.isRequired,
    maxDate: PropTypes.string.isRequired,
    displayFormat: PropTypes.string.isRequired,
    timescale: PropTypes.string.isRequired,
    parseFormat: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    options: PropTypes.array.isRequired,
  };

  static defaultProps = {
    parseFormat: 'L',
  };

  constructor() {
    super();
    this.handleSelect = this.handleSelect.bind(this);
  }

  getCurrentDate() {
    return moment(this.props.date, this.props.parseFormat);
  }

  handleSelect(event) {
    const selectedDate = this.getCurrentDate().set(this.props.timescale, event.target.value);

    const minDate = moment(this.props.minDate, this.props.parseFormat);
    const maxDate = moment(this.props.maxDate, this.props.parseFormat);

    if (selectedDate > maxDate) {
      this.props.onChange(maxDate);
      return;
    }

    if (selectedDate < minDate) {
      this.props.onChange(minDate);
      return;
    }

    this.props.onChange(selectedDate);
  }

  render() {
    const {
      date, displayFormat, parseFormat, timescale,
    } = this.props;

    const currentDate = dateLocale.format(moment(date, parseFormat), displayFormat);

    return (
      <div className="date-selector-label">
        <div
          className="date-selector-label__item date-dropdown-select"
          style={{ textAlign: 'center' }}
        >
          <div className="date-dropdown-label">{currentDate}</div>
          <select className="date-dropdown-element" onChange={this.handleSelect}
            defaultValue={moment(date, parseFormat).get(timescale)}
          >
            {this.props.options.map(option =>
              (
                <option
                  value={option.value}
                  key={option.value}
                >{option.label}</option>
              )
            )}
          </select>
        </div>
      </div>
    );
  }
}
