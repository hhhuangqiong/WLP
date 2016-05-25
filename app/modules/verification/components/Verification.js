import { isEmpty } from 'lodash';
import React, { PropTypes } from 'react';
import { FluxibleMixin } from 'fluxible-addons-react';
import fetchAppIds from '../../../main/actions/fetchAppIds';
import ApplicationStore from '../../../main/stores/ApplicationStore';

const Verification = React.createClass({
  propTypes: {
    children: PropTypes.element.isRequired,
  },

  contextTypes: {
    router: PropTypes.object.isRequired,
    executeAction: PropTypes.func.isRequired,
    params: PropTypes.object,
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

  componentDidMount() {
    // auto select the default appId from the list
    // TODO: optimize this UX with server side rendering

    if (isEmpty(this.state.appIds)) {
      const { identity } = this.context.params;
      this.context.executeAction(fetchAppIds, { carrierId: identity });
    }
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
