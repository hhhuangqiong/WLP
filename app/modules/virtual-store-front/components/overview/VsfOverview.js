import React from 'react';

import * as FilterBar from '../../../../main/components/FilterBar';
import FilterBarNavigation from '../../../../main/filter-bar/components/FilterBarNavigation';
import VsfMonthlyStatsContainer from '../../containers/VsfMonthlyStatsContainer';
import VsfSummaryStatsContainer from '../../containers/VsfSummaryStatsContainer';

export default function VsfOverview() {
  return (
    <div className="row">
      <FilterBar.Wrapper>
        <FilterBarNavigation section="vsf" />
      </FilterBar.Wrapper>

      <div className="large-24 columns">
        <VsfMonthlyStatsContainer />
        <VsfSummaryStatsContainer />
      </div>
    </div>
  );
}
