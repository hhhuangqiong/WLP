import React from 'react';
import FluxibleMixin from 'fluxible/addons/FluxibleMixin';
import {RouteHandler} from 'react-router';
import {concurrent} from 'contra';

import AuthMixin from '../../../utils/AuthMixin';

import ApplicationStore from '../../../main/stores/ApplicationStore';
import AuthStore from '../../../main/stores/AuthStore';

import fetchAppIds from '../../../main/actions/fetchAppIds';

const debug = require('debug')('app:end-user/components/EndUsers');

var EndUsers = React.createClass({
  contextTypes: {
    router: React.PropTypes.func.isRequired,
    executeAction: React.PropTypes.func.isRequired
  },

  mixins: [FluxibleMixin, AuthMixin],

  statics: {
    storeListeners: [ApplicationStore]
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

export default EndUsers;
