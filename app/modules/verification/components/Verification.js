import React from 'react';
import { FluxibleMixin } from 'fluxible-addons-react';
import { RouteHandler } from 'react-router';

import AuthMixin from '../../../utils/AuthMixin';

import ApplicationStore from '../../../main/stores/ApplicationStore';

const Verification = React.createClass({
  contextTypes: {
    router: React.PropTypes.func.isRequired,
    executeAction: React.PropTypes.func.isRequired,
  },

  mixins: [FluxibleMixin, AuthMixin],

  statics: {
    storeListeners: [ApplicationStore],
  },

  getInitialState() {
    return {
      appIds: this.getStore(ApplicationStore).getAppIds() || [],
    };
  },

  onChange() {
    this.setState({
      appIds: this.getStore(ApplicationStore).getAppIds(),
    });
  },

  render() {
    return (
      <RouteHandler appIds={this.state.appIds} />
    );
  },
});

export default Verification;
