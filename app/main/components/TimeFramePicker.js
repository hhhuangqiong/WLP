import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';

export default class TimeFramePicker extends Component {
  render() {
    return (
      <div className="time-frame-picker">
        {
          this.props.frames.map((frame) => {
            let frameValue = frame.split(' ')[0];
            let frameUnit = frame.split(' ')[1].replace('hours', 'hrs');

            return (
              <span
                key={frame}
                onClick={this.props.onChange.bind(this, frame)}
                className={classNames({ 'active': this.props.currentFrame === frame })}
              >
                {`${frameValue} ${frameUnit}`}
              </span>
            );
          })
        }
      </div>
    );
  }
}

TimeFramePicker.propTypes = {
  frames: PropTypes.object.isRequired,
  currentFrame: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
};
