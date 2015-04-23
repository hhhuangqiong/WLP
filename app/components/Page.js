'use strict';
import React from 'react';
import PageStore from 'app/stores/PageStore';
import {FluxibleMixin} from 'fluxible';

var Page = React.createClass({
  mixins: [FluxibleMixin],
  statics: {
    storeListeners: [PageStore]
  },
  getInitialState: function () {
    return this.getStore(PageStore).getState();
  },
  onChange: function () {
    let state = this.getStore(PageStore).getState();
    this.setState(state);
  },
  render: function() {
    return (
      <p>{this.state.content}</p>
    );
  }
});

export default Page;
