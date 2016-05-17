import { isEmpty } from 'lodash';
import React, { PropTypes } from 'react';
import classNames from 'classnames';
import moment from 'moment';
import { defineMessages, injectIntl } from 'react-intl';

import TimeFramePicker from '../../../../main/components/TimeFramePicker';
import * as Panel from '../../../../main/components/Panel';
import * as DataGrid from '../../../../main/statistics/components/DataGrid';
import CombinationChart from '../../../../main/components/CombinationChart';
import LastUpdateTime, { TIME_TYPES } from '../../../../main/statistics/components/LastUpdateTime';
import { parseTimeRange, LAST_UPDATE_TIME_FORMAT } from '../../../../utils/timeFormatter';

const TIME_FRAMES = ['24 hours', '7 days', '30 days'];
const TOOLTIP_TIME_FORMAT = 'lll';

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
  vsfUnit: {
    id: 'vsf.unit',
    defaultMessage: 'items',
  },
  vsfPurchase: {
    id: 'vsf.purchase',
    defaultMessage: 'purchases',
  },
  vsfLineChartTitle: {
    id: 'vsf.overview.lineChartTitle',
    defaultMessage: 'Total Purchase',
  },
});

function getLineChartData(data) {
  return !isEmpty(data) ? [
    {
      name: 'linechart',
      type: 'line',
      data,
      color: '#FB3940',
    },
  ] : null;
}

function getLineChartXAxis(timeframe) {
  const { from, quantity, timescale } = parseTimeRange(timeframe);

  return {
    start: from,
    tickCount: parseInt(quantity, 10),
    tickInterval: (timescale === 'day' ? 24 : 1) * 3600 * 1000,
    crosshair: {
      color: 'rgba(76,145,222,0.3)',
    },
  };
}

export default function VsfSummaryStats({
  intl,
  isLoading,
  onChange,
  timeFrame,
  stats,
  lineChartData,
}) {
  const { formatMessage } = intl;
  const {
    voiceSticker,
    sticker,
    animation,
    credit,
  } = stats;

  const lastUpdate = (
    <LastUpdateTime
      type={TIME_TYPES.TIME_RANGE}
      time={timeFrame}
      timeFormat={LAST_UPDATE_TIME_FORMAT}
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
      <Panel.Body customClass="narrow no-padding">
        <div className="inner-wrap">
          <div className="chart-cell large-24 columns">
            <div className="chart-cell__header row">
              <div className="large-4 columns">
                <div className="chart-cell__header__title text-center">
                  {formatMessage(MESSAGES.vsfLineChartTitle)}
                </div>
              </div>
              <div className="large-3 columns end chart-cell__overview">
                <div className="chart-cell__overview__value">
                  {lineChartData.sum && lineChartData.sum.toLocaleString()}
                </div>
                <div className="chart-cell__overview__unit">
                  {formatMessage(MESSAGES.vsfUnit)}
                </div>
              </div>
            </div>
            <div className="line-chart chart-cell__chart row">
              <CombinationChart
                alignTicks={false}
                className="attempt-line"
                lines={getLineChartData(lineChartData.breakdown)}
                xAxis={getLineChartXAxis(timeFrame)}
                yAxis={[{}]}
                showLegend={false}
                formatter={function tooltipFormatter() {
                  return `
                          <div style="text-align: center">
                            <div>${moment(this.x).local().format(TOOLTIP_TIME_FORMAT)}</div>
                            <div>${this.y.toLocaleString()}</div>
                            <div>${formatMessage(MESSAGES.vsfPurchase)}</div>
                          </div>
                        `;
                }}
                />
            </div>
          </div>
        </div>
      </Panel.Body>
    </Panel.Wrapper>
  );
}

VsfSummaryStats.propTypes = {
  intl: PropTypes.object.isRequired,
  isLoading: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  timeFrame: PropTypes.string.isRequired,
  stats: PropTypes.shape({
    voiceSticker: PropTypes.number.isRequired,
    sticker: PropTypes.number.isRequired,
    animation: PropTypes.number.isRequired,
    credit: PropTypes.number.isRequired,
  }),
  lineChartData: PropTypes.shape({
    sum: PropTypes.number,
    breakdown: PropTypes.array,
  }),
};

export default injectIntl(VsfSummaryStats);
