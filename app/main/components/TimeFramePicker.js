import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';

export default class TimeFramePicker extends Component {
  render() {
    return (
      <div className="time-frame-picker">
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
  onChange: PropTypes.func.isRequired
};
