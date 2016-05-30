import React from 'react';

import * as FilterBar from '../../../../main/components/FilterBar';
import FilterBarNavigation from '../../../../main/filter-bar/components/FilterBarNavigation';
import MonthlyStats from '../../containers/MonthlyStats';
import SummaryStats from '../../containers/SummaryStats';

export default function VsfOverview() {
  return (
    <div className="row">
      <FilterBar.Wrapper>
        <FilterBarNavigation section="vsf" tab="overview" />
      </FilterBar.Wrapper>

      <div className="large-24 columns">
        <MonthlyStats />
        <SummaryStats />
      </div>
    </div>
  );
}
