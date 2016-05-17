import React from 'react';

import SummaryStatsContainer from '../containers/SummaryStats';
import DetailStatsContainer from '../containers/DetailStats';

export default function Overview() {
  return (
    <div>
      <SummaryStatsContainer />
      <DetailStatsContainer />
    </div>
  );
}
