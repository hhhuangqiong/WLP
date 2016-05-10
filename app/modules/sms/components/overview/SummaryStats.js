import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { defineMessages, injectIntl } from 'react-intl';

import TimeFramePicker from '../../../../main/components/TimeFramePicker';
import * as Panel from '../../../../main/components/Panel';
import * as DataGrid from '../../../../main/statistics/components/DataGrid';

const TIME_FRAMES = ['24 hours', '7 days', '30 days'];

const MESSAGES = defineMessages({
  summary: {
    id: 'overview.summary',
    defaultMessage: 'Summary',
  },
  totalSmsSent: {
    id: 'sms.overview.totalSmsSent',
    defaultMessage: 'Total SMS Sent',
  },
  totalSmsSubmitted: {
    id: 'sms.overview.totalSmsSubmitted',
    defaultMessage: 'Total SMS Submitted',
  },
  totalSmsUndelivered: {
    id: 'sms.overview.totalSmsUndelivered',
    defaultMessage: 'Total SMS Undelivered',
  },
  totalSmsRejected: {
    id: 'sms.overview.totalSmsRejected',
    defaultMessage: 'Total SMS Rejected',
  },
  dataUpdatedTill: {
    id: 'dataUpdatedTill',
    defaultMessage: 'Data updated till',
  },
});

export default function SummaryStats({
  intl,
  lastUpdate,
  isLoading,
  onChange,
  timeFrame,
  stats,
}) {
  const { formatMessage } = intl;
  const {
    sent,
    submitted,
    undelivered,
    rejected,
  } = stats;

  return (
    <Panel.Wrapper>
      <Panel.Header
        className="narrow"
        title={formatMessage(MESSAGES.summary)}
        caption={`${formatMessage(MESSAGES.dataUpdatedTill)}:${lastUpdate}`}
      >
        <div className={classNames('tiny-spinner', { active: isLoading })}></div>
        <TimeFramePicker
          className={classNames({ disabled: isLoading })}
          frames={TIME_FRAMES}
          currentFrame={timeFrame}
          onChange={onChange}
        />
      </Panel.Header>
      <Panel.Body className="narrow no-padding">
        <DataGrid.Wrapper>
          <DataGrid.Cell
            title={formatMessage(MESSAGES.totalSmsSent)}
            data={sent.total}
            changeDir={sent.direction}
            changeAmount={sent.change}
            changePercentage={sent.percent}
            changeEffect="positive"
            isLoading={isLoading}
          />
          <DataGrid.Cell
            title={formatMessage(MESSAGES.totalSmsSubmitted)}
            data={submitted.total}
            changeDir={submitted.direction}
            changeAmount={submitted.change}
            changePercentage={submitted.percent}
            changeEffect="positive"
            isLoading={isLoading}
          />
          <DataGrid.Cell
            title={formatMessage(MESSAGES.totalSmsUndelivered)}
            data={undelivered.total}
            changeDir={undelivered.direction}
            changeAmount={undelivered.change}
            changePercentage={undelivered.percent}
            changeEffect="positive"
            isLoading={isLoading}
          />
          <DataGrid.Cell
            title={formatMessage(MESSAGES.totalSmsRejected)}
            data={rejected.total}
            changeDir={rejected.direction}
            changeAmount={rejected.change}
            changePercentage={rejected.percent}
            changeEffect="positive"
            isLoading={isLoading}
          />
        </DataGrid.Wrapper>
      </Panel.Body>
    </Panel.Wrapper>
  );
}

SummaryStats.propTypes = {
  intl: PropTypes.object.isRequired,
  lastUpdate: PropTypes.string.isRequired,
  isLoading: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  timeFrame: PropTypes.string.isRequired,
  stats: PropTypes.shape({
    sent: PropTypes.number.isRequired,
    submitted: PropTypes.number.isRequired,
    undelivered: PropTypes.number.isRequired,
    rejected: PropTypes.number.isRequired,
  }),
};

export default injectIntl(SummaryStats);
