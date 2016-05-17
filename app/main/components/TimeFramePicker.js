import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { defineMessages, injectIntl } from 'react-intl';
import { HOUR_FORMAT_LABEL, parseTimeRange } from '../../utils/timeFormatter';

const MESSAGES = defineMessages({
  timeFrameHours: {
    id: 'timeFrameHours',
    defaultMessage: 'hrs',
  },
  timeFrameDays: {
    id: 'timeFrameDays',
    defaultMessage: 'days',
  },
});

function TimeFramePicker({ className, frames, currentFrame, onChange, intl }) {
  const { formatMessage } = intl;

  if (!Array.isArray(frames)) {
    return null;
  }

  return (
    <div className={classNames('time-frame-picker', className)}>
      {
        frames.map(frame => {
          const { quantity, timescale } = parseTimeRange(frame);
          const displayTimescale = timescale === HOUR_FORMAT_LABEL ?
            formatMessage(MESSAGES.timeFrameHours) :
            formatMessage(MESSAGES.timeFrameDays);

          return (
            <span
              key={frame}
              className={classNames('item', { active: currentFrame === frame })}
              onClick={() => onChange(frame)}
            >
              <span>{`${quantity} ${displayTimescale}`}</span>
            </span>
          );
        })
      }
    </div>
  );
}

TimeFramePicker.propTypes = {
  frames: PropTypes.arrayOf(PropTypes.string).isRequired,
  currentFrame: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }),
};

export default injectIntl(TimeFramePicker);
