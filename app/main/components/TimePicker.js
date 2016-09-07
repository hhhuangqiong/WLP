import React, { PropTypes } from 'react';

import * as dateLocale from '../../utils/dateLocale';

const TimePicker = React.createClass({
  propTypes: {
    onChange: PropTypes.func.isRequired,
    // moment object
    datetime: PropTypes.object.isRequired,
    format: PropTypes.string.isRequired,
    timePickerId: PropTypes.string.isRequired,
    className: PropTypes.string,
    minDate: PropTypes.object,
  },

  componentDidMount() {
    $(document).foundation('dropdown', 'reflow');
  },

  addHour() {
    this.props.onChange(this
      .props
      .datetime
      .add(1, 'h')
      .format()
    );
  },

  addMinute() {
    this.props.onChange(this
      .props
      .datetime
      .add(1, 'm')
      .format()
    );
  },

  subtractHour() {
    this.props.onChange(this
      .props
      .datetime
      .subtract(1, 'h')
      .format());
  },

  subtractMinute() {
    this.props.onChange(this
      .props
      .datetime
      .subtract(1, 'm')
      .format()
    );
  },

  isActive(timescale) {
    const {
      minDate,
      datetime,
    } = this.props;

    if (!minDate) {
      return true;
    }

    const previousTime = datetime.clone().subtract(1, timescale);

    return previousTime > minDate;
  },

  render() {
    const { datetime, format, timePickerId, className } = this.props;

    return (
      <div className="left">
        <div
          data-dropdown={timePickerId}
          aria-controls={timePickerId}
          aria-expanded="false"
          className={className}
        >
          <span className="left interactive-button date-range-picker__date-span">
            {dateLocale.format(datetime, format)}
          </span>
        </div>

        <div
          id={timePickerId}
          data-dropdown-content
          className="f-dropdown"
          aria-hidden="true"
          aria-autoclose="false"
          tabIndex="-1"
        >
          <table className="timepicker-dropdown-table">
            <tr>
              <td onClick={this.addHour} className="cursor-pointer">
                <strong>+</strong>
              </td>
              <td></td>
              <td onClick={this.addMinute} className="cursor-pointer">
                <strong>+</strong>
              </td>
            </tr>

            <tr className="cursor-default">
              <td>{datetime.format('H')}</td>
              <td>:</td>
              <td>{datetime.format('mm')}</td>
            </tr>

            <tr>
              <If condition={this.isActive('hours')}>
                <td onClick={this.subtractHour} className="cursor-pointer">
                  <strong>-</strong>
                </td>
              <Else />
                <td></td>
              </If>
              <td></td>
              <If condition={this.isActive('mintues')}>
                <td onClick={this.subtractMinute} className="cursor-pointer">
                  <strong>-</strong>
                </td>
              <Else />
                <td></td>
              </If>
            </tr>
          </table>

        </div>
      </div>
    );
  },
});

export default TimePicker;
