import classnames from 'classnames';
import moment from 'moment';
import React, { Component, PropTypes } from 'react';

export default class DateSelectorGrid extends Component {
  static propTypes = {
    date: PropTypes.string.isRequired,
    minDate: PropTypes.string.isRequired,
    displayFormat: PropTypes.element.isRequired,
    timescale: PropTypes.string.isRequired,
    inputFormat: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    options: PropTypes.array.isRequired,
  };

  static defaultProps = {
    inputFormat: 'L',
  };

  constructor() {
    super();

    this.handleClickPrevious = this.handleClickPrevious.bind(this);
    this.handleClickNext = this.handleClickNext.bind(this);
    this.nextDate = this.nextDate.bind(this);
    this.getCurrentDate = this.getCurrentDate.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
  }

  getCurrentDate() {
    return moment(this.props.date, this.props.inputFormat);
  }

  render() {
    const {
      date, displayFormat, inputFormat,
    } = this.props;

    const currentDate = moment(date, inputFormat).format(displayFormat);

    return (
      <div className="date-selector-grid">
        <div
          className={classnames('date-selector-grid__item', 'arrow', { disabled: !this.hasPrevious() })}
          onClick={this.handleClickPrevious}
        >
          {'<'}
        </div>

        <div className="date-selector-grid__item date-dropdown-select" style={{textAlign: 'center'}}>
          <div className="date-dropdown-label">{currentDate}</div>
          <select className="date-dropdown-element" onChange={this.handleSelect}>
            {this.props.options.map(option => {
              return (
                <option value={option.label}>{option.label}</option>
              );
            })}
          </select>
        </div>

        <div
          className={classnames('date-selector-grid__item', 'arrow', { disabled: !this.hasNext() })}
          onClick={this.handleClickNext}
        >
          {'>'}
        </div>
      </div>
    );
  }

  previousDate() {
    const previousDate = this.getCurrentDate().subtract(1, this.props.timescale);
    const minDate = moment(this.props.minDate, this.props.inputFormat);

    if (previousDate.isSameOrBefore(this.props.minDate)) return minDate;
    return previousDate;
  }

  nextDate() {
    const nextDate = this.getCurrentDate().add(1, this.props.timescale);

    if (nextDate > moment()) return moment();
    return nextDate;
  }

  hasNext() {
    return this.getCurrentDate().isBefore(moment().startOf('month').format('L'));
  }

  hasPrevious() {
    return this.getCurrentDate().isAfter(moment(this.props.minDate).format('L'));
  }

  handleSelect(event) {
    const modifiedDate = this.getCurrentDate().set(this.props.timescale, event.target.value).format(this.props.inputFormat);
    this.props.onChange(modifiedDate);
  }

  handleClickPrevious() {
    if (!this.hasPrevious()) return;
    this.props.onChange(this.previousDate().format(this.props.inputFormat));
  }

  handleClickNext() {
    if (!this.hasNext()) return;
    this.props.onChange(this.nextDate().format(this.props.inputFormat));
  }
}
