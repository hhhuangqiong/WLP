'use strict';

import React from 'react';
import {FluxibleMixin} from 'fluxible';
import {RouteHandler} from 'react-router';

import Nav from 'app/components/Nav';
import Timestamp from 'app/components/Timestamp';

import ApplicationStore from 'app/stores/ApplicationStore';

var Application = React.createClass({
  mixins: [FluxibleMixin],
  statics: {
    storeListeners: [ApplicationStore]
  },
  getInitialState: function () {
    return this.getStore(ApplicationStore).getState();
  },
  onChange: function () {
    var state = this.getStore(ApplicationStore).getState();
    this.setState(state);
  },
  render: function () {
    return (
      <div>
        <Nav />
          <RouteHandler />
        <Timestamp />
      </div>
    );
  }
});

export default Application;
