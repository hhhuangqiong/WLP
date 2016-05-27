import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { defineMessages, injectIntl } from 'react-intl';

import * as Panel from '../../../main/components/Panel';
import LocationTable from '../../../main/statistics/components/LocationTable';
import HighMap from '../../../main/statistics/components/HighMap';
import LastUpdateTime, { TIME_TYPES } from '../../../main/statistics/components/LastUpdateTime';
import { LAST_UPDATE_TIME_FORMAT } from '../../../utils/timeFormatter';

const MESSAGES = defineMessages({
  registeredUsersByCountry: {
    id: 'overview.registeredUsersByCountry',
    defaultMessage: 'Registered Users by Country',
  },
  userUnit: {
    id: 'overview.unit',
    defaultMessage: 'Users',
  },
});

function DetailStats({
  intl,
  isLoading,
  geographicChartData,
}) {
  const { formatMessage } = intl;
  const lastUpdate = (
    <LastUpdateTime
      type={TIME_TYPES.LATEST}
      timescale="day"
      timeFormat={LAST_UPDATE_TIME_FORMAT}
    />
  );

  return (
    <Panel.Wrapper>
      <Panel.Header
        className="narrow"
        title={formatMessage(MESSAGES.registeredUsersByCountry)}
        caption={lastUpdate}
      >
        <div className={classNames('tiny-spinner', { active: isLoading })}></div>
      </Panel.Header>
      <Panel.Body className="narrow no-padding">
        <div className="map-chart chart-cell__chart row">
          <div className="large-8 columns">
            <LocationTable
              data={geographicChartData}
              title={{
                unit: formatMessage(MESSAGES.userUnit),
              }}
              count={10}
              isLoading={isLoading}
            />
          </div>
          <div className="large-16 columns">
            <HighMap
              id="geographic-chart"
              data={geographicChartData}
              isLoading={isLoading}
              unit={formatMessage(MESSAGES.userUnit)}
            />
          </div>
        </div>
      </Panel.Body>
    </Panel.Wrapper>
  );
}

DetailStats.propTypes = {
  intl: PropTypes.object.isRequired,
  lastUpdate: PropTypes.string.isRequired,
  isLoading: PropTypes.bool.isRequired,
  geographicChartData: PropTypes.arrayOf(PropTypes.shape({
    code: PropTypes.string,
    value: PropTypes.number,
  })),
};

export default injectIntl(DetailStats);
