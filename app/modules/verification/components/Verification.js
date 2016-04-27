import React, { PropTypes } from 'react';
import { FluxibleMixin } from 'fluxible-addons-react';

import ApplicationStore from '../../../main/stores/ApplicationStore';

const Verification = React.createClass({
  propTypes: {
    children: PropTypes.element.isRequired,
  },

  contextTypes: {
    router: PropTypes.object.isRequired,
    executeAction: PropTypes.func.isRequired,
  },

  mixins: [FluxibleMixin],

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
    if (!this.props.children) {
      return null;
    }

    return (
      React.cloneElement(this.props.children, {
        appIds: this.state.appIds,
      })
    );
  },
});

export default Verification;
