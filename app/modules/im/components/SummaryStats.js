import { get, isEmpty, map } from 'lodash';
import React, { PropTypes } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import classNames from 'classnames';
import moment from 'moment';
import * as Panel from './../../../main/components/Panel';
import * as DataGrid from '../../../main/statistics/components/DataGrid';
import LastUpdateTime from '../../../main/statistics/components/LastUpdateTime';
import CombinationChart from '../../../main/components/CombinationChart';
import TimeFramePicker from '../../../main/components/TimeFramePicker';
import { parseTimeRange } from '../../../utils/timeFormatter';
import { SUMMARY_TYPES } from '../constants/index';

const MESSAGES = defineMessages({
  summaryStatistic: {
    id: 'im.overview.summaryStatistic',
    defaultMessage: 'Summary Statistic',
  },
  imUnit: {
    id: 'im.unit',
    defaultMessage: 'Messages',
  },
  imUnitSent: {
    id: 'im.unitSent',
    defaultMessage: 'Messages sent',
  },
  textTitle: {
    id: 'im.overview.text',
    defaultMessage: 'Total IM Sent - Text',
  },
  imageTitle: {
    id: 'im.overview.image',
    defaultMessage: 'Total IM Sent - Image',
  },
  videoTitle: {
    id: 'im.overview.video',
    defaultMessage: 'Total IM Sent - Video',
  },
  audioTitle: {
    id: 'im.overview.audio',
    defaultMessage: 'Total IM Sent - Audio',
  },
  multiTitle: {
    id: 'im.overview.multi',
    defaultMessage: 'Total IM Sent - Sticker/ Animation/ Audio Effect',
  },
  sharingTitle: {
    id: 'im.overview.sharing',
    defaultMessage: 'Total IM Sent - Sharing',
  },
  totalChartTitle: {
    id: 'im.overview.totalChart.title',
    defaultMessage: 'Total IM',
  },
});

const TIME_FRAMES = ['24 hours', '7 days'];
const TOOLTIP_TIME_FORMAT = 'lll';

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

const SummaryStats = props => {
  const { intl: { formatMessage } } = props;
  const {
    isLoading,
    summaryData,
    lineChartData,
    selectedTimeFrame,
    onSelectedTimeFrameChange,
  } = props;

  const Caption = (
    <LastUpdateTime type="TIME_RANGE" time={selectedTimeFrame} />
  );

  return (
    <div className="large-24 columns">
      <Panel.Wrapper>
        <Panel.Header
          customClass="narrow"
          title={formatMessage(MESSAGES.summaryStatistic)}
          caption={Caption}
        >
          <div className={classNames('tiny-spinner', { active: isLoading })}></div>
          <TimeFramePicker
            className={classNames({ disabled: isLoading })}
            frames={TIME_FRAMES}
            currentFrame={selectedTimeFrame}
            onChange={onSelectedTimeFrameChange}
          />
        </Panel.Header>
        <Panel.Body customClass="narrow no-padding">
          <DataGrid.Wrapper>
            {
              map(SUMMARY_TYPES, type => (
                <DataGrid.Cell
                  title={formatMessage(MESSAGES[`${type}Title`])}
                  data={get(summaryData, `${type}.value`)}
                  changeDir={get(summaryData, `${type}.change.direction`)}
                  changeAmount={get(summaryData, `${type}.change.value`)}
                  changeEffect={get(summaryData, `${type}.change.effect`)}
                  changePercentage={get(summaryData, `${type}.change.percentage`)}
                  isLoading={isLoading}
                />
              ))
            }
          </DataGrid.Wrapper>
        </Panel.Body>
        <Panel.Body customClass="narrow no-padding">
          <div className="inner-wrap">
            <div className="chart-cell large-24 columns">
              <div className="chart-cell__header row">
                <div className="large-4 columns">
                  <div className="chart-cell__header__title text-center">
                    {formatMessage(MESSAGES.totalChartTitle)}
                  </div>
                </div>
                <div className="large-3 columns end chart-cell__overview">
                  <div className="chart-cell__overview__value">
                    {lineChartData.sum && lineChartData.sum.toLocaleString()}
                  </div>
                  <div className="chart-cell__overview__unit">
                    {formatMessage(MESSAGES.imUnitSent)}
                  </div>
                </div>
              </div>
              <div className="line-chart chart-cell__chart row">
                <CombinationChart
                  alignTicks={false}
                  className="attempt-line"
                  lines={getLineChartData(lineChartData.breakdown)}
                  xAxis={getLineChartXAxis(selectedTimeFrame)}
                  yAxis={[{}]}
                  showLegend={false}
                  formatter={function tooltipFormatter() {
                    return `
                            <div style="text-align: center">
                              <div>${moment(this.x).local().format(TOOLTIP_TIME_FORMAT)}</div>
                              <div>${this.y.toLocaleString()}</div>
                              <div>${formatMessage(MESSAGES.imUnitSent)}</div>
                            </div>
                          `;
                  }}
                />
              </div>
            </div>
          </div>
        </Panel.Body>
      </Panel.Wrapper>
    </div>
  );
};

SummaryStats.propTypes = {
  intl: PropTypes.object,
  summaryData: PropTypes.object,
  lineChartData: PropTypes.shape({
    sum: PropTypes.number,
    breakdown: PropTypes.array,
  }),
  isLoading: PropTypes.bool,
  selectedTimeFrame: PropTypes.string,
  onSelectedTimeFrameChange: PropTypes.func,
};

export default injectIntl(SummaryStats);
