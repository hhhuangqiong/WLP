import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { defineMessages, injectIntl } from 'react-intl';

import TimeFramePicker from '../../../../main/components/TimeFramePicker';
import * as Panel from '../../../../main/components/Panel';
import * as DataGrid from '../../../../main/statistics/components/DataGrid';
import CombinationChart from '../../../../main/components/CombinationChart';

const TIME_FRAMES = ['24 hours', '7 days', '30 days'];

const MESSAGES = defineMessages({
  summary: {
    id: 'overview.summary',
    defaultMessage: 'Summary',
  },
  totalVoiceStickerPurchased: {
    id: 'vsf.overview.totalVoiceStickerPurchased',
    defaultMessage: 'Total Voice Sticker Purchased',
  },
  totalStickersPurchased: {
    id: 'vsf.overview.totalStickersPurchased',
    defaultMessage: 'Total Stickers Purchased',
  },
  totalAnimationPurchased: {
    id: 'vsf.overview.totalAnimationPurchased',
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
    voiceSticker,
    sticker,
    animation,
    credit,
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
            title={formatMessage(MESSAGES.totalVoiceStickerPurchased)}
            data={voiceSticker.total}
            changeDir={voiceSticker.direction}
            changeAmount={voiceSticker.change}
            changePercentage={voiceSticker.percent}
            changeEffect="positive"
            isLoading={isLoading}
          />
          <DataGrid.Cell
            title={formatMessage(MESSAGES.totalStickersPurchased)}
            data={sticker.total}
            changeDir={sticker.direction}
            changeAmount={sticker.change}
            changePercentage={sticker.percent}
            changeEffect="positive"
            isLoading={isLoading}
          />
          <DataGrid.Cell
            title={formatMessage(MESSAGES.totalAnimationPurchased)}
            data={animation.total}
            changeDir={animation.direction}
            changeAmount={animation.change}
            changePercentage={animation.percent}
            changeEffect="positive"
            isLoading={isLoading}
          />
          <DataGrid.Cell
            title={formatMessage(MESSAGES.totalCreditsPurchased)}
            data={credit.total}
            changeDir={credit.direction}
            changeAmount={credit.change}
            changePercentage={credit.percent}
            changeEffect="positive"
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
    voiceSticker: PropTypes.number.isRequired,
    sticker: PropTypes.number.isRequired,
    animation: PropTypes.number.isRequired,
    credit: PropTypes.number.isRequired,
  }),
};

export default injectIntl(VsfSummaryStats);
