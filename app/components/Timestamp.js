'use strict';
import React from 'react';
import {FluxibleMixin} from 'fluxible';

import TimeStore from 'app/stores/TimeStore';
import ApplicationStore from 'app/stores/ApplicationStore';
import timestampActions from 'app/actions/timestamp';

var Timestamp = React.createClass({
  mixins: [FluxibleMixin],
  statics: {
    storeListeners: [TimeStore]
  },
  getInitialState: function () {
    return this.getStore(TimeStore).getState();
  },
  /**
   * to be called upon FluxibleStore.emitChange()
   *
   * @method onChange
   */
  onChange: function () {
    var state = this.getStore(TimeStore).getState();
    this.setState(state);
  },
  onReset: function (event) {
    this.executeAction(timestampActions.updateTime);
  },
  render: function() {
    return (
      <em onClick={this.onReset} style={{fontSize: '.8em'}}>{this.state.time}</em>
    );
  }
});

export default Timestamp;
