import moment from 'moment';
import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { defineMessages, injectIntl } from 'react-intl';

import DateSelector from '../../../../main/components/DateSelector';
import * as Panel from './../../../../main/components/Panel';
import * as DataGrid from '../../../../main/statistics/components/DataGrid';
import LastUpdateTime, { TIME_TYPES } from '../../../../main/statistics/components/LastUpdateTime';
import { SHORT_DATE_TIME_FORMAT, SHORT_DATE_FORMAT } from '../../../../utils/timeFormatter';

const MESSAGES = defineMessages({
  monthlyStatistic: {
    id: 'overview.monthlyStatistic',
    defaultMessage: 'Monthly Statistic',
  },
  numberOfTotalPurchases: {
    id: 'vsf.overview.numberOfTotalPurchases',
    defaultMessage: 'Number of Total Purchases',
  },
  dataUpdatedTill: {
    id: 'dataUpdatedTill',
    defaultMessage: 'Data updated till',
  },
});

function VsfMonthlyStats({ intl, isLoading, onChange, date, stats }) {
  const { formatMessage } = intl;
  const lastUpdate = (
    <LastUpdateTime
      type={TIME_TYPES.MONTHLY}
      time={date}
      timeFormat={SHORT_DATE_TIME_FORMAT}
    />
  );

  return (
    <Panel.Wrapper>
      <Panel.Header
        className="narrow"
        title={formatMessage(MESSAGES.monthlyStatistic)}
        caption={lastUpdate}
      >
        <div className={classNames('tiny-spinner', { active: isLoading })}></div>
        <DateSelector
          className={classNames({ disabled: isLoading })}
          date={date}
          maxDate={moment().subtract(1, 'month').endOf('month').format(SHORT_DATE_FORMAT)}
          onChange={onChange}
        />
      </Panel.Header>
      <Panel.Body className="narrow no-padding">
        <DataGrid.Wrapper>
          <DataGrid.Cell
            title={formatMessage(MESSAGES.numberOfTotalPurchases)}
            data={stats.total}
            changeDir={stats.direction}
            changeAmount={stats.change}
            changePercentage={stats.percent}
            changeEffect="positive"
            isLoading={isLoading}
          />
        </DataGrid.Wrapper>
      </Panel.Body>
    </Panel.Wrapper>
  );
}

VsfMonthlyStats.propTypes = {
  intl: PropTypes.object.isRequired,
  isLoading: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  date: PropTypes.string.isRequired,
  stats: PropTypes.shape({
    // it will check in the data grid
    total: PropTypes.number,
    direction: PropTypes.string,
    change: PropTypes.number,
    percent: PropTypes.string,
  }),
};

export default injectIntl(VsfMonthlyStats);
