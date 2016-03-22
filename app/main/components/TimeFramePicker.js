import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import moment from 'moment';

export default class TimeFramePicker extends Component {
  render() {
    const {
      className,
      customClass,
    } = this.props;

    return (
      <div className={classNames('time-frame-picker', className, customClass)}>
        {
          this
            .props
            .frames
            .map(frame => (
                <span
                  className={classNames('item', { active: this.props.currentFrame === frame })}
                  key={frame}
                  onClick={this.props.onChange.bind(null, frame)}
                >
                  {frame.replace('hours', 'hrs')}
                </span>
              )
            )
        }
      </div>
    );
  }
}

TimeFramePicker.propTypes = {
  frames: PropTypes.arrayOf(PropTypes.string).isRequired,
  currentFrame: PropTypes.string.isRequired,
  className: PropTypes.string.isRequired,
  customClass: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.array,
  ]),
  onChange: PropTypes.func.isRequired,
};

// Buffer time in minutes
const BUFFER_TIME_FOR_PROXY_HOURLY = 20;
const BUFFER_TIME_FOR_PROXY_DAILY = 480;

export function parseTimeRange(timeRange) {
  const splitedTimeRange = timeRange.split(' ');
  const quantity = parseInt(splitedTimeRange[0], 10) || 1;
  const timescale = splitedTimeRange[1] === 'days' ? 'day' : 'hour';
  // +1 to align the time to the corresponding bucket
  // for the time that is 24 hours before 12:09, we need 13:00
  // 12:09 + 1 hour = 13:09, startOf(13:09) = 13:00, 13:00 - 24 hour = 13:00

  // The requirement has changed to
  // `display only the timescale unit which has complete data set`
  // so the above comment has become invalid as the latest timescale for hour
  // is always incomplete, which means
  // for 12:09, it should show only up to 12:00, but not 13:00
  const to = timescale === 'hour' ?
    moment()
      // This is the buffer time of hourly proxy cache
      .subtract(BUFFER_TIME_FOR_PROXY_HOURLY, 'minutes')
      .startOf(timescale)
      .valueOf() :
    // Issue: WLP-584
    // from day n-1 to day n-7
    moment()
      .subtract(1, timescale)
      // This is the buffer time of daily proxy cache
      .subtract(BUFFER_TIME_FOR_PROXY_DAILY, 'minutes')
      .endOf(timescale)
      .valueOf();

  const from = timescale === 'hour' ?
      moment(to)
        .clone()
        .subtract(quantity, timescale)
        .startOf(timescale)
        .valueOf() :
      moment(to)
        .clone()
        .subtract(quantity - 1, timescale)
        .startOf(timescale).valueOf();

  return {
    from,
    to,
    quantity,
    timescale,
  };
}
