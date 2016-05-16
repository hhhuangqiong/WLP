import moment from 'moment';
import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { defineMessages, injectIntl } from 'react-intl';

import DateSelector from '../../../../main/components/DateSelector';
import * as Panel from './../../../../main/components/Panel';
import * as DataGrid from '../../../../main/statistics/components/DataGrid';

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

function VsfMonthlyStats({ intl, lastUpdate, isLoading, onChange, date, stats }) {
  const { formatMessage } = intl;

  return (
    <Panel.Wrapper>
      <Panel.Header
        className="narrow"
        title={formatMessage(MESSAGES.monthlyStatistic)}
        caption={`${formatMessage(MESSAGES.dataUpdatedTill)}:${lastUpdate}`}
      >
        <div className={classNames('tiny-spinner', { active: isLoading })}></div>
        <DateSelector
          className={classNames({ disabled: isLoading })}
          date={date}
          maxDate={moment().subtract(1, 'month').endOf('month')}
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
  intl: PropTypes.string.isRequired,
  lastUpdate: PropTypes.string.isRequired,
  isLoading: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  date: PropTypes.object.isRequired,
  stats: PropTypes.shape({
    total: PropTypes.string.isRequired,
    direction: PropTypes.string.isRequired,
    change: PropTypes.string.isRequired,
    percent: PropTypes.string.isRequired,
  }),
};

export default injectIntl(VsfMonthlyStats);