import classnames from 'classnames';
import moment from 'moment';
import React, { Component, PropTypes } from 'react';

export default class DateSelectorArrow extends Component {
  static propTypes = {
    date: PropTypes.string.isRequired,
    minDate: PropTypes.string.isRequired,
    maxDate: PropTypes.string.isRequired,
    timescale: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    direction: PropTypes.string,
    parseFormat: PropTypes.string,
  };

  static defaultProps = {
    direction: 'left',
    parseFormat: 'L',
  };

  constructor() {
    super();

    this.getCurrentDate = this.getCurrentDate.bind(this);
    this.getArrowDirection = this.getArrowDirection.bind(this);

    this.hasNext = this.hasNext.bind(this);
    this.hasPrevious = this.hasPrevious.bind(this);

    this.handleClickPrevious = this.handleClickPrevious.bind(this);
    this.handleClickNext = this.handleClickNext.bind(this);
    this.handleClick = this.handleClick.bind(this);

    this.previousDate = this.previousDate.bind(this);
    this.nextDate = this.nextDate.bind(this);
  }

  getArrowDirection() {
    return this.props.direction === 'left' ? '<' : '>';
  }

  getCurrentDate() {
    return moment(this.props.date, this.props.parseFormat);
  }

  render() {
    return (
      <div
        className={classnames('date-selector-label__item', 'arrow', { disabled: this.isDisabled() })}
        onClick={this.handleClick}
      >
        {this.getArrowDirection()}
      </div>
    );
  }

  isDisabled() {
    if (this.props.direction === 'left') return !this.hasPrevious();
    return !this.hasNext();
  }

  previousDate() {
    const previousDate = this.getCurrentDate().subtract(1, this.props.timescale);
    const minDate = moment(this.props.minDate, this.props.parseFormat);

    if (previousDate.isSameOrBefore(this.props.minDate)) return minDate;
    return previousDate;
  }

  nextDate() {
    const nextDate = this.getCurrentDate().add(1, this.props.timescale);
    const maxDate = moment(this.props.maxDate, this.props.parseFormat);

    if (nextDate > maxDate) return maxDate;
    return nextDate;
  }

  handleClick() {
    return this.props.direction === 'left' ? this.handleClickPrevious() : this.handleClickNext();
  }

  hasNext() {
    return this.getCurrentDate().endOf(this.props.timescale).isBefore(this.props.maxDate);
  }

  hasPrevious() {
    return this.getCurrentDate().startOf(this.props.timescale).isAfter(moment(this.props.minDate).format('L'));
  }

  handleClickPrevious() {
    if (!this.hasPrevious()) return;
    this.props.onChange(this.previousDate().format(this.props.parseFormat));
  }

  handleClickNext() {
    if (!this.hasNext()) return;
    this.props.onChange(this.nextDate().format(this.props.parseFormat));
  }
}
