import React from 'react';
import FluxibleMixin from 'fluxible/addons/FluxibleMixin';

import EndUserStore from '../stores/EndUserStore';

import EndUserTable from './EndUserTable';
import EndUserProfile from './EndUserProfile';
import Pagination from './Pagination';

var EndUsers = React.createClass({
  mixins: [FluxibleMixin],
  statics: {
    storeListeners: [EndUserStore]
  },
  getInitialState: function () {
    return this.getStore(EndUserStore).getState();
  },
  onChange: function() {
    let state = this.getStore(EndUserStore).getState();
    this.setState(state);
  },
  render: function() {

    let userDetails = '';
    if (this.state.currentUser) {
      userDetails = <EndUserProfile />
    }

    return (
      <div className="row">
        <div className="contents-panel info-panel large-18 columns">
          <EndUserTable />
          <Pagination />
        </div>
        <div className="large-6 columns">
          {userDetails}
        </div>
      </div>
    );
  }
});

export default EndUsers;
