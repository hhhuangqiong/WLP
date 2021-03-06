import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { defineMessages, injectIntl } from 'react-intl';

import * as Panel from '../../../main/components/Panel';
import * as DataGrid from '../../../main/statistics/components/DataGrid';
import LastUpdateTime, { TIME_TYPES } from '../../../main/statistics/components/LastUpdateTime';
import { SHORT_DATE_TIME_FORMAT } from '../../../utils/timeFormatter';

const MESSAGES = defineMessages({
  summary: {
    id: 'overview.summary',
    defaultMessage: 'Summary',
  },
  accumulatedRegisterediOSUser: {
    id: 'overview.accumulatedRegisterediOSUser',
    defaultMessage: 'Accumulated Registered iOS User',
  },
  accumulatedVerifiediOSUser: {
    id: 'overview.accumulatedVerifiediOSUser',
    defaultMessage: 'Accumulated Verified iOS User',
  },
  accumulatedRegisteredAndroidUser: {
    id: 'overview.accumulatedRegisteredAndroidUser',
    defaultMessage: 'Accumulated Registered Android User',
  },
  accumulatedVerifiedAndroidUser: {
    id: 'overview.accumulatedVerifiedAndroidUser',
    defaultMessage: 'Accumulated Verified Android User',
  },
});

function OverviewSummaryStats({
  intl,
  isLoading,
  stats,
}) {
  const { formatMessage } = intl;
  const {
    registeredAndroid,
    registeredIos,
    /* Disabled for WLP-824
    verifiedAndroid,
    verifiedIos,
    */
  } = stats;
  const lastUpdate = (
    <LastUpdateTime
      type={TIME_TYPES.LATEST}
      timescale="day"
      timeFormat={SHORT_DATE_TIME_FORMAT}
    />
  );

  return (
    <Panel.Wrapper>
      <Panel.Header
        className="narrow"
        title={formatMessage(MESSAGES.summary)}
        caption={lastUpdate}
      >
        <div className={classNames('tiny-spinner', { active: isLoading })}></div>
      </Panel.Header>
      <Panel.Body className="narrow no-padding">
        <DataGrid.Wrapper>
          <DataGrid.Cell
            title={formatMessage(MESSAGES.accumulatedRegisterediOSUser)}
            data={registeredIos}
            isLoading={isLoading}
          />
          {
            /* Disabled for WLP-824
            <DataGrid.Cell
            title={formatMessage(MESSAGES.accumulatedVerifiediOSUser)}
            data={verifiedIos}
            isLoading={isLoading}
            />
            */
          }
          <DataGrid.Cell
            title={formatMessage(MESSAGES.accumulatedRegisteredAndroidUser)}
            data={registeredAndroid}
            isLoading={isLoading}
          />
          {
            /* Disabled for WLP-824
            <DataGrid.Cell
              title={formatMessage(MESSAGES.accumulatedVerifiedAndroidUser)}
              data={verifiedAndroid}
              isLoading={isLoading}
            />
            */
          }
        </DataGrid.Wrapper>
      </Panel.Body>
    </Panel.Wrapper>
  );
}

OverviewSummaryStats.propTypes = {
  intl: PropTypes.object.isRequired,
  isLoading: PropTypes.bool.isRequired,
  stats: PropTypes.shape({
    registeredAndroid: PropTypes.number.isRequired,
    registeredIos: PropTypes.number.isRequired,
    /* Disabled for WLP-824
    verifiedAndroid: PropTypes.number.isRequired,
    verifiedIos: PropTypes.number.isRequired,
    */
  }),
};

export default injectIntl(OverviewSummaryStats);
