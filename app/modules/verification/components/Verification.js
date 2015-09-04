import React from 'react';
import FluxibleMixin from 'fluxible/addons/FluxibleMixin';
import {RouteHandler} from 'react-router';
import {concurrent} from 'contra';

import AuthMixin from '../../../utils/AuthMixin';

import ApplicationStore from '../../../stores/ApplicationStore';

import fetchAppIds from '../actions/fetchAppIds';

const debug = require('debug')('app:verification/components/Verification');

var Verification = React.createClass({
  contextTypes: {
    router: React.PropTypes.func.isRequired,
    executeAction: React.PropTypes.func.isRequired
  },

  mixins: [FluxibleMixin, AuthMixin],

  statics: {
    storeListeners: [ApplicationStore],

    fetchData: function (context, params, query, done) {
      context.executeAction(fetchAppIds, {}, done || Function.prototype);
    }
  },

  getInitialState: function () {
    return {
      appIds: this.getStore(ApplicationStore).getAppIds() || []
    };
  },

  onChange: function () {
    this.setState({
      appIds: this.getStore(ApplicationStore).getAppIds()
    });
  },

  render: function () {
    return (
      <RouteHandler appIds={this.state.appIds} />
    );
  }
});

export default Verification;
