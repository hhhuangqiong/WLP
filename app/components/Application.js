import React from 'react';

import {connectToStores, provideContext} from 'fluxible/addons';
import {handleHistory} from 'fluxible-router';

// TODO maybe not doing this here
import {PublicHtml, AuthenticatedHtml} from 'app/components/Wrapper';

import ApplicationStore from '../stores/ApplicationStore';

class Application extends React.Component {
  // not sure about this signuature though
  constructor(props, context) {
    super(props, context);
  }

  render() {
    let url = this.props.currentNavigate.url;

    // looking for alternatives, and better be negative default
    let authenticated = !(/signin|home/.test(url));
    let Handler = this.props.currentRoute.get('handler');

    // keep it in the meantimes
    if(/company/.test(url)) {
      Handler = <Companies context={this.props.context} subPage={this.state.route.params.subPage}/>;
    }

    //Handler component is passed as prop children to wrapper component
    //see this: https://facebook.github.io/react/docs/reusable-components.html#single-child
    if (authenticated) {
      return (
        <AuthenticatedHtml pageTitle={this.props.pageTitle}>
          <Handler />
        </AuthenticatedHtml>
      )
    } else {
      return (
        <PublicHtml>
          <Handler />
        </PublicHtml>
      )
    }
  }

  componentDidUpdate(prevProps, prevState) {
    var newState = this.state;
    if (newState.pageTitle === prevState.pageTitle) {
      return;
    }
    document.title = newState.pageTitle;
  }
}

Application.contextTypes = {
  getStore: React.PropTypes.func,
  executeAction: React.PropTypes.func
};

Application = connectToStores(Application, [ApplicationStore], function (stores, props) {
  return {
    ApplicationStore: stores.ApplicationStore.getState()
  };
});

// not save scroll position in history state for now
Application = handleHistory(Application, {enableScroll: false});

Application = provideContext(Application);

export default Application;
