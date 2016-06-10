import { get } from 'lodash';
import moment from 'moment';
import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { defineMessages, injectIntl } from 'react-intl';

import DateSelector from '../../../main/components/DateSelector';
import * as Panel from './../../../main/components/Panel';
import * as DataGrid from '../../../main/statistics/components/DataGrid';
import LastUpdateTime, { TIME_TYPES } from '../../../main/statistics/components/LastUpdateTime';

import {
  SHORT_DATE_TIME_FORMAT,
} from '../../../utils/timeFormatter';

const MESSAGES = defineMessages({
  monthlyStatistic: {
    id: 'overview.monthlyStatistic',
    defaultMessage: 'Monthly Statistic',
  },
  numberOfTotalSmsSent: {
    id: 'sms.overview.numberOfTotalSmsSent',
    defaultMessage: 'Number of Total SMS Sent',
  },
});

function MonthlyStats({ intl, isLoading, onChange, date, stats }) {
  const { formatMessage } = intl;
  const lastUpdate = (
    <LastUpdateTime type={TIME_TYPES.MONTHLY} time={date} timeFormat={SHORT_DATE_TIME_FORMAT} />
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
          maxDate={moment().subtract(1, 'month').endOf('month')}
          onChange={onChange}
        />
      </Panel.Header>
      <Panel.Body className="narrow no-padding">
        <DataGrid.Wrapper>
          <DataGrid.Cell
            title={formatMessage(MESSAGES.numberOfTotalSmsSent)}
            data={get(stats, 'value')}
            changeDir={get(stats, 'change.direction')}
            changeAmount={get(stats, 'change.value')}
            changeEffect={get(stats, 'change.effect')}
            changePercentage={get(stats, 'change.percentage')}
            isLoading={isLoading}
          />
        </DataGrid.Wrapper>
      </Panel.Body>
    </Panel.Wrapper>
  );
}

MonthlyStats.propTypes = {
  intl: PropTypes.string.isRequired,
  isLoading: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  date: PropTypes.object.isRequired,
  stats: PropTypes.shape({
    value: PropTypes.string,
    change: PropTypes.shape({
      direction: PropTypes.string,
      effect: PropTypes.string,
      percentage: PropTypes.number,
      value: PropTypes.number,
    }),
  }),
};

export default injectIntl(MonthlyStats);
