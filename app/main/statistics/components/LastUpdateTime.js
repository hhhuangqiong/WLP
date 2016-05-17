import moment from 'moment';
import React, { PropTypes } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { parseTimeRange } from '../../../utils/timeFormatter';

const MESSAGES = defineMessages({
  dataUpdatedTill: {
    id: 'dataUpdatedTill',
    defaultMessage: 'Data updated till',
  },
});

export const TIME_TYPES = {
  MONTHLY: 'MONTHLY',
  TIME_RANGE: 'TIME_RANGE',
  LATEST: 'LATEST',
};

const LastUpdateTime = props => {
  const { intl: { formatMessage } } = props;
  const { type, time, timeFormat } = props;
  let { timescale } = props;

  let lastUpdate;

  if (type === TIME_TYPES.MONTHLY) {
    lastUpdate = moment(time, 'L').endOf('month').format(timeFormat);
  } else if (type === TIME_TYPES.TIME_RANGE) {
    const { to, timescale: _timescale } = parseTimeRange(time);
    timescale = _timescale;
    lastUpdate = timescale === 'hour' ? moment(to).subtract(1, timescale) : moment(to);
    lastUpdate = lastUpdate.endOf(timescale).format(timeFormat);
  } else if (type === TIME_TYPES.LATEST) {
    lastUpdate = moment().subtract(1, timescale).endOf(timescale).format(timeFormat);
  }

  return (
    <span className="caption inline">
      {`${formatMessage(MESSAGES.dataUpdatedTill)}: ${lastUpdate}`}
    </span>
  );
};

LastUpdateTime.propTypes = {
  intl: PropTypes.object,
  type: PropTypes.oneOf([
    TIME_TYPES.MONTHLY,
    TIME_TYPES.TIME_RANGE,
  ]),
  time: PropTypes.string,
  timescale: PropTypes.string,
  timeFormat: PropTypes.string,
};

LastUpdateTime.defaultProps = {
  timeFormat: 'MMM DD, YYYY H:mm',
};

export default injectIntl(LastUpdateTime);
