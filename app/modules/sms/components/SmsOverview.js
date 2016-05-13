import React from 'react';

import * as FilterBar from '../../../main/components/FilterBar';
import FilterBarNavigation from '../../../main/filter-bar/components/FilterBarNavigation';
import SmsMonthlyStatsContainer from '../containers/MonthlyStats';
import SmsSummaryStatsContainer from '../containers/SummaryStats';

export default function SmsOverview() {
  return (
    <div className="row">
      <FilterBar.Wrapper>
        <FilterBarNavigation section="vsf" />
      </FilterBar.Wrapper>

      <div className="large-24 columns">
        <SmsMonthlyStatsContainer />
        <SmsSummaryStatsContainer />
      </div>
    </div>
  );
}
