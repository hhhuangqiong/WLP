import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import { FormattedMessage } from 'react-intl';
import MonthlyStatsContainer from '../containers/MonthlyStats';
import SummaryStatsContainer from '../containers/SummaryStats';
import * as FilterBar from '../../../main/components/FilterBar';

const IMOverivew = (props, { params }) => {
  const { role, identity } = params;

  return (
    <div className="row">
      <FilterBar.Wrapper>
        <FilterBar.NavigationItems>
          <Link to={`/${role}/${identity}/im/overview`} activeClassName="active">
            <FormattedMessage id="overview" defaultMessage="Overview" />
          </Link>
          <Link to={`/${role}/${identity}/im/details`} activeClassName="active">
            <FormattedMessage id="detailsReport" defaultMessage="Details Report" />
          </Link>
        </FilterBar.NavigationItems>
      </FilterBar.Wrapper>
      <div className="inner-wrap im-overview">
        <div className="large-24 columns">
          <MonthlyStatsContainer />
          <SummaryStatsContainer />
        </div>
      </div>
    </div>
  );
};

IMOverivew.contextTypes = {
  params: PropTypes.object,
};

export default IMOverivew;
