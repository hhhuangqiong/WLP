import React from 'react';

import MonthlyStatsContainer from '../containers/MonthlyStats';
import SummaryStatsContainer from '../containers/SummaryStats';
import * as FilterBar from '../../../main/components/FilterBar';
import FilterBarNavigation from '../../../main/filter-bar/components/FilterBarNavigation';

export default () => (
  <div className="row">
    <FilterBar.Wrapper>
      <FilterBarNavigation section="im" tab="overview" />
    </FilterBar.Wrapper>
    <div className="inner-wrap im-overview">
      <div className="large-24 columns">
        <MonthlyStatsContainer />
        <SummaryStatsContainer />
      </div>
    </div>
  </div>
);
