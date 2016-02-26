import { reduce } from 'lodash';
import moment from 'moment';
import classnames from 'classnames';
import React, { Component, PropTypes } from 'react';

import DateSelectorLabel from './DateSelectorLabel';
import DateSelectorArrow from './DateSelectorArrow';

const YEARS_BACKWARD = 5;

export default class DateSelector extends Component {
  getMonths() {
    const monthArray = Array.apply(0, Array(12)).map((_, i) => i);

    return reduce(monthArray, (result, n) => {
      const option = { value: n, label: moment().month(n).format('MMMM') };
      result.push(option);
      return result;
    }, []);
  }

  getYears() {
    const years = [];

    for (let i = 0; i < YEARS_BACKWARD; i++) {
      years.push({
        value: (i > 0) ? moment().subtract(i, 'years').format('YYYY') : moment().format('YYYY'),
        label: (i > 0) ? moment().subtract(i, 'years').format('YYYY') : moment().format('YYYY'),
      });
    }

    return years;
  }

  getSelectableMonths() {
    return this.filterByDateRange(
      this.getMonths(),
      'month',
      this.props.minDate, this.props.maxDate, this.props.date
    );
  }

  getSelectableYears() {
    return this.filterByDateRange(
      this.getYears(),
      'year',
      this.props.minDate,
      this.props.maxDate,
      this.props.date
    );
  }

  filterByDateRange(dates, timescale, minDate, maxDate, currentDate) {
    return dates.filter(option => {
      const optionTime = moment(currentDate, 'L').set(timescale, +option.value);

      // Avoid using isBetween since it is used exclusively
      const isBetween =
        optionTime.isSameOrAfter(minDate, timescale) &&
        optionTime.isSameOrBefore(maxDate, timescale);

      return isBetween;
    });
  }

  render() {
    return (
      <div className={classnames('date-selector', this.props.className)}>
        <div className="date-selector__item">
          <DateSelectorArrow
            direction="left"
            date={this.props.date}
            minDate={this.props.minDate}
            maxDate={this.props.maxDate}
            timescale="months"
            onChange={this.props.onChange}
          />
        </div>

        <div className="date-selector__item">
          <DateSelectorLabel
            date={this.props.date}
            minDate={this.props.minDate}
            maxDate={this.props.maxDate}
            displayFormat={this.props.monthFormat}
            timescale="months"
            options={this.getSelectableMonths()}
            onChange={this.props.onChange}
          />
        </div>

        <div className="date-selector__item">
          <DateSelectorLabel
            date={this.props.date}
            minDate={this.props.minDate}
            maxDate={this.props.maxDate}
            displayFormat={this.props.yearFormat}
            timescale="years"
            options={this.getSelectableYears()}
            onChange={this.props.onChange}
          />
        </div>

        <div className="date-selector__item">
          <DateSelectorArrow
            direction="right"
            date={this.props.date}
            minDate={this.props.minDate}
            maxDate={this.props.maxDate}
            timescale="months"
            onChange={this.props.onChange}
          />
        </div>
      </div>
    );
  }
}

DateSelector.propTypes = {
  date: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  minDate: PropTypes.string,
  maxDate: PropTypes.string,
  monthFormat: PropTypes.string,
  yearFormat: PropTypes.string,
  className: PropTypes.string,
};

DateSelector.defaultProps = {
  monthFormat: 'MMMM',
  yearFormat: 'YYYY',
  maxDate: moment().endOf('month').format('L'),
};
