import React from 'react';
import {Link} from 'react-router';

import FluxibleMixin from 'fluxible/addons/FluxibleMixin';

import AuthMixin from '../../../utils/AuthMixin';

import * as FilterBar from './../../../main/components/FilterBar';

var VerificationOverview = React.createClass({
  contextTypes: {
    router: React.PropTypes.func.isRequired,
    executeAction: React.PropTypes.func.isRequired
  },

  mixins: [FluxibleMixin, AuthMixin],

  statics: {
    storeListeners: []
  },

  render: function () {
    let { role, identity } = this.context.router.getCurrentParams();

    return (
      <div className="row">
        <FilterBar.Wrapper>
          <FilterBar.NavigationItems>
            <Link to="verification" params={{role, identity}}>Overview</Link>
            <Link to="verification-details" params={{role, identity}}>Details Report</Link>
          </FilterBar.NavigationItems>
        </FilterBar.Wrapper>

        <div className="verification-overview">Overview</div>
      </div>
    );
  }
});

export default VerificationOverview;