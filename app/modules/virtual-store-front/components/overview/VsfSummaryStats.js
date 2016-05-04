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
  totalMusicPurchased: {
    id: 'vsf.overview.totalMusicPurchased',
    defaultMessage: 'Total Music Purchased',
  },
  totalStickersPurchased: {
    id: 'vsf.overview.totalStickersPurchased',
    defaultMessage: 'Total Stickers Purchased',
  },
  totalSoundEffectPurchased: {
    id: 'vsf.overview.totalSoundEffectPurchased',
    defaultMessage: 'Total Sound Effect Purchased',
  },
  totalCreditsPurchased: {
    id: 'vsf.overview.totalCreditsPurchased',
    defaultMessage: 'Total Credits Purchased',
  },
  dataUpdatedTill: {
    id: 'dataUpdatedTill',
    defaultMessage: 'Data updated till',
  },
});

export default function VsfSummaryStats({
  intl,
  lastUpdate,
  isLoading,
  onChange,
  timeFrame,
  stats,
}) {
  const { formatMessage } = intl;
  const {
    totalMusic,
    totalStickers,
    totalSoundEffect,
    totalCredits,
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
            title={formatMessage(MESSAGES.totalMusicPurchased)}
            data={totalMusic}
            isLoading={isLoading}
          />
          <DataGrid.Cell
            title={formatMessage(MESSAGES.totalStickersPurchased)}
            data={totalStickers}
            isLoading={isLoading}
          />
          <DataGrid.Cell
            title={formatMessage(MESSAGES.totalSoundEffectPurchased)}
            data={totalSoundEffect}
            isLoading={isLoading}
          />
          <DataGrid.Cell
            title={formatMessage(MESSAGES.totalCreditsPurchased)}
            data={totalCredits}
            isLoading={isLoading}
          />
        </DataGrid.Wrapper>
      </Panel.Body>
    </Panel.Wrapper>
  );
}

VsfSummaryStats.propTypes = {
  intl: PropTypes.object.isRequired,
  lastUpdate: PropTypes.string.isRequired,
  isLoading: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  timeFrame: PropTypes.string.isRequired,
  stats: PropTypes.shape({
    totalMusic: PropTypes.number.isRequired,
    totalStickers: PropTypes.number.isRequired,
    totalSoundEffect: PropTypes.number.isRequired,
    totalCredits: PropTypes.number.isRequired,
  }),
};

export default injectIntl(VsfSummaryStats);
