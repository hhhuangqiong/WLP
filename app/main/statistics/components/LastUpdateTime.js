import moment from 'moment';
import React, { PropTypes } from 'react';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { parseTimeRange, LAST_UPDATE_TIME_FORMAT } from '../../../utils/timeFormatter';
import * as dateLocale from '../../../utils/dateLocale';

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
    lastUpdate = dateLocale.format(moment(time, 'L').endOf('month'), timeFormat);
  } else if (type === TIME_TYPES.TIME_RANGE) {
    const { to, timescale: _timescale } = parseTimeRange(time);
    timescale = _timescale;
    lastUpdate = timescale === 'hour' ? moment(to).subtract(1, timescale) : moment(to);
    lastUpdate = dateLocale.format(lastUpdate.endOf(timescale), timeFormat);
  } else if (type === TIME_TYPES.LATEST) {
    lastUpdate = dateLocale.format(moment().subtract(1, timescale).endOf(timescale), timeFormat);
  }

  return (
    <span className="panel-last-update-time caption inline">
      {`${formatMessage(MESSAGES.dataUpdatedTill)}: ${lastUpdate}`}
    </span>
  );
};

LastUpdateTime.propTypes = {
  intl: intlShape,
  type: PropTypes.oneOf([
    TIME_TYPES.MONTHLY,
    TIME_TYPES.TIME_RANGE,
  ]),
  time: PropTypes.string,
  timescale: PropTypes.string,
  timeFormat: PropTypes.string,
};

LastUpdateTime.defaultProps = {
  timeFormat: LAST_UPDATE_TIME_FORMAT,
  type: TIME_TYPES.LATEST,
};

export default injectIntl(LastUpdateTime);
