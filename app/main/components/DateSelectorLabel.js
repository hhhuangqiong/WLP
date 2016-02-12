import moment from 'moment';
import React, { Component, PropTypes } from 'react';

export default class DateSelectorLabel extends Component {
  static propTypes = {
    date: PropTypes.string.isRequired,
    minDate: PropTypes.string.isRequired,
    maxDate: PropTypes.string.isRequired,
    displayFormat: PropTypes.element.isRequired,
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

  render() {
    const {
      date, displayFormat, parseFormat, timescale,
    } = this.props;

    const currentDate = moment(date, parseFormat).format(displayFormat);

    return (
      <div className="date-selector-label">
        <div className="date-selector-label__item date-dropdown-select" style={{textAlign: 'center'}}>
          <div className="date-dropdown-label">{currentDate}</div>
          <select className="date-dropdown-element" onChange={this.handleSelect}>
            {this.props.options.map(option => {
              return (
                <option
                  value={option.label}
                  selected={+option.value === moment(date, parseFormat).get(timescale)}
                >{option.label}</option>
              );
            })}
          </select>
        </div>
      </div>
    );
  }

  handleSelect(event) {
    const selectedDate = this.getCurrentDate().set(this.props.timescale, event.target.value);

    const minDate = moment(this.props.minDate, this.props.parseFormat);
    const maxDate = moment(this.props.maxDate, this.props.parseFormat);

    if (selectedDate > maxDate) return this.props.onChange(maxDate);
    if (selectedDate < minDate) return this.props.onChange(minDate);

    this.props.onChange(selectedDate);
  }
}
