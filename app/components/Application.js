import React from 'react';

import {connectToStores, provideContext} from 'fluxible/addons';
import {handleHistory} from 'fluxible-router';

// TODO maybe not doing this here
import {PublicHtml, AuthenticatedHtml} from './Wrapper';

import ApplicationStore from '../stores/ApplicationStore';

class Application extends React.Component {
  // not sure about this signature though
  constructor(props, context) {
    super(props, context);
  }

  render() {
    let url = this.props.currentNavigate.url;

    // looking for alternatives, and better be negative default
    let authenticated = !(/signin|home/.test(url));
    let Handler = this.props.currentRoute.get('handler');

    let params = this.props.currentRoute.get('params').size > 0 ? this.props.currentRoute.get('params') : null;

    //Handler component is passed as prop children to wrapper component
    //see this: https://facebook.github.io/react/docs/reusable-components.html#single-child
    if (authenticated) {
      return (
        <AuthenticatedHtml pageTitle={this.props.pageTitle}>
          <Handler params={params} />
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

  componentDidUpdate(prevProps) {
    let newProps = this.props;
    if (newProps.ApplicationStore.pageTitle === prevProps.ApplicationStore.pageTitle) {
      return;
    }
    document.title = newProps.ApplicationStore.pageTitle;
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
