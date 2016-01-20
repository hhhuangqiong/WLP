import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import moment from 'moment';

export default class TimeFramePicker extends Component {
  render() {
    return (
      <div className={classNames(`time-frame-picker`, this.props.customClass)}>
        {
          this.props.frames.map((frame) => {
            return (
              <span
                key={frame}
                onClick={this.props.onChange.bind(null, frame)}
                className={classNames({ 'active': this.props.currentFrame === frame })}
              >
                {frame.replace('hours', 'hrs')}
              </span>
            );
          })
        }
      </div>
    );
  }
}

TimeFramePicker.propTypes = {
  frames: PropTypes.arrayOf(PropTypes.string).isRequired,
  currentFrame: PropTypes.string.isRequired,
  customClass: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.array
  ]),
  onChange: PropTypes.func.isRequired
};

export function parseTimeRange(timeRange) {
  let splitedTimeRange = timeRange.split(' ');
  let quantity = parseInt(splitedTimeRange[0], 10) || 1;
  let timescale = splitedTimeRange[1] === 'days' ? 'day' : 'hour';
  // +1 to align the time to the corresponding bucket
  // for the time that is 24 hours before 12:09, we need 13:00
  // 12:09 + 1 hour = 13:09, startOf(13:09) = 13:00, 13:00 - 24 hour = 13:00
  //let to = moment().add(1, timescale).startOf(timescale).valueOf();
  let to = timescale === 'hour' ?
    moment().add(1, timescale).startOf(timescale).valueOf() :
    // Issue: WLP-584
    // from day n-1 to day n-7
    moment().subtract(1, timescale).endOf(timescale).valueOf();
  let from = timescale === 'hour' ? moment(to).subtract(quantity, timescale).startOf(timescale).valueOf() : moment(to).subtract(quantity - 1, timescale).startOf(timescale).valueOf();

  return {
    from,
    to,
    quantity,
    timescale
  };
}
