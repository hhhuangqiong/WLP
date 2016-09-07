import { get } from 'lodash';
import React, { PropTypes } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import classNames from 'classnames';
import moment from 'moment';
import * as Panel from './../../../main/components/Panel';
import * as DataGrid from '../../../main/statistics/components/DataGrid';
import LastUpdateTime, { TIME_TYPES } from '../../../main/statistics/components/LastUpdateTime';
import { SHORT_DATE_TIME_FORMAT, SHORT_DATE_FORMAT } from '../../../utils/timeFormatter';
import DateSelector from '../../../main/components/DateSelector';

const MESSAGES = defineMessages({
  monthlyStatistic: {
    id: 'im.overview.monthlyStatistic',
    defaultMessage: 'Monthly Statistic',
  },
  totalImSent: {
    id: 'im.overview.totalImSent',
    defaultMessage: 'Number of total IM Sent Volume',
  },
  imUnit: {
    id: 'im.unit',
    defaultMessage: 'Messages',
  },
});

const MonthlyStats = props => {
  const { intl: { formatMessage } } = props;
  const {
    isLoading,
    data,
    selectedDate,
    onSelectedDateChange,
  } = props;

  const lastUpdate = (
    <LastUpdateTime type={TIME_TYPES.MONTHLY} time={selectedDate} timeFormat={SHORT_DATE_TIME_FORMAT} />
  );

  return (
    <div className="large-24 columns">
      <Panel.Wrapper>
        <Panel.Header
          customClass="narrow"
          title={formatMessage(MESSAGES.monthlyStatistic)}
          caption={lastUpdate}
        >
          <div className={classNames('tiny-spinner', { active: isLoading })}></div>
          <DateSelector
            className={classNames({ disabled: isLoading })}
            date={selectedDate}
            // eslint-disable-next-line max-len
            minDate={moment().subtract(1, 'months').subtract(1, 'years').startOf('month').format(SHORT_DATE_FORMAT)}
            maxDate={moment().subtract(1, 'months').endOf('month').format(SHORT_DATE_FORMAT)}
            onChange={onSelectedDateChange}
          />
        </Panel.Header>
        <Panel.Body customClass="narrow no-padding">
          <DataGrid.Wrapper>
            <DataGrid.Cell
              title={formatMessage(MESSAGES.totalImSent)}
              data={get(data, 'value')}
              unit={formatMessage(MESSAGES.imUnit)}
              changeDir={get(data, 'change.direction')}
              changeAmount={get(data, 'change.value')}
              changeEffect={get(data, 'change.effect')}
              changePercentage={get(data, 'change.percentage')}
              isLoading={isLoading}
            />
          </DataGrid.Wrapper>
        </Panel.Body>
      </Panel.Wrapper>
    </div>
  );
};

MonthlyStats.propTypes = {
  intl: PropTypes.object,
  isLoading: PropTypes.bool,
  data: PropTypes.shape({
    value: PropTypes.number,
    change: PropTypes.shape({
      value: PropTypes.number,
      direction: PropTypes.string,
      effect: PropTypes.string,
      percentage: PropTypes.number,
    }),
  }),
  // string instead of moment object
  selectedDate: PropTypes.string,
  onSelectedDateChange: PropTypes.func,
};

export default injectIntl(MonthlyStats);
