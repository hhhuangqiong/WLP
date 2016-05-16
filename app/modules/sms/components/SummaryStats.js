import { capitalize, get, isEmpty, map } from 'lodash';
import React, { PropTypes } from 'react';
import moment from 'moment';
import classNames from 'classnames';
import { defineMessages, injectIntl } from 'react-intl';

import TimeFramePicker from '../../../main/components/TimeFramePicker';
import * as Panel from '../../../main/components/Panel';
import * as DataGrid from '../../../main/statistics/components/DataGrid';
import CombinationChart from '../../../main/components/CombinationChart';
import LocationTable from '../../../main/statistics/components/LocationTable';
import HighMap from '../../../main/statistics/components/HighMap';
import LastUpdateTime, { TIME_TYPES } from '../../../main/statistics/components/LastUpdateTime';
import { parseTimeRange, LAST_UPDATE_TIME_FORMAT } from '../../../utils/timeFormatter';

import { SUMMARY_TYPES } from '../constants/index';

const MESSAGES = defineMessages({
  summary: {
    id: 'overview.summary',
    defaultMessage: 'Summary',
  },
  totalSmsTotal: {
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
  smsLineChartTitle: {
    id: 'sms.overview.lineChartTitle',
    defaultMessage: 'Total',
  },
  smsGeographicChartTitle: {
    id: 'sms.overview.geographicChartTitle',
    defaultMessage: 'Destination',
  },
  smsUnitSent: {
    id: 'sms.overview.unitSent',
    defaultMessage: 'SMS Sent',
  },
});

const TIME_FRAMES = ['24 hours', '7 days', '30 days'];
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

export default function SummaryStats({
  intl,
  isLoading,
  onChange,
  timeFrame,
  summaryData,
  lineChartData,
  geographicChartData,
}) {
  const { formatMessage } = intl;
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
          {
            map(SUMMARY_TYPES, type => (
              <DataGrid.Cell
                title={formatMessage(MESSAGES[`totalSms${capitalize(type)}`])}
                data={get(summaryData, `${type}.value`)}
                changeDir={get(summaryData, `${type}.change.direction`)}
                changeAmount={get(summaryData, `${type}.change.value`)}
                changePercentage={get(summaryData, `${type}.change.percentage`)}
                changeEffect={get(summaryData, `${type}.change.effect`)}
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
                  {formatMessage(MESSAGES.smsLineChartTitle)}
                </div>
              </div>
              <div className="large-3 columns end chart-cell__overview">
                <div className="chart-cell__overview__value">
                  {lineChartData.sum && lineChartData.sum.toLocaleString()}
                </div>
                <div className="chart-cell__overview__unit">
                  {formatMessage(MESSAGES.smsUnitSent)}
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
                            <div>${formatMessage(MESSAGES.smsUnitSent)}</div>
                          </div>
                        `;
                }}
              />
            </div>
          </div>
        </div>
      </Panel.Body>
      <Panel.Body customClass="narrow no-padding">
        <div className="inner-wrap">
          <div className="chart-cell large-24 columns">
            <div className="chart-cell__header row">
              <div className="large-4 columns">
                <div className="chart-cell__header__title text-center">
                  {formatMessage(MESSAGES.smsGeographicChartTitle)}
                </div>
              </div>
            </div>
            <div className="map-chart chart-cell__chart row">
              <div className="large-8 columns">
                <LocationTable
                  data={geographicChartData}
                  title={{
                    unit: formatMessage(MESSAGES.smsUnitSent),
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
                />
              </div>
            </div>
          </div>
        </div>
      </Panel.Body>
    </Panel.Wrapper>
  );
}

SummaryStats.propTypes = {
  intl: PropTypes.object.isRequired,
  isLoading: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  timeFrame: PropTypes.string.isRequired,
  summaryData: PropTypes.shape({
    total: PropTypes.number,
    submitted: PropTypes.number,
    undelivered: PropTypes.number,
    rejected: PropTypes.number,
  }),
  lineChartData: PropTypes.shape({
    sum: PropTypes.number,
    breakdown: PropTypes.array,
  }),
  geographicChartData: PropTypes.array,
};

export default injectIntl(SummaryStats);
