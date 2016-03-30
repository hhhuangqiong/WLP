import _ from 'lodash';
import React from 'react';
import Router from 'react-router';

import FluxibleComponent from 'fluxible/addons/FluxibleComponent';

import * as env from '../utils/env';

const debug = require('debug');

// make it disabled in default
debug.disable();

// enable it only for development
if (env.isDev()) {
  // need to be exposed to window so we can
  // config on browser console
  window.debug = debug;
  debug.enable('*');
}

const bootstrapDebug = debug('app:client');

// TODO rename the file as 'app'
import app from '../app';
import routes from '../routes';
import fetchData from '../utils/fetchData';
import loadSession from '../main/actions/loadSession';

window.React = React; // For chrome dev tool support

const mountNode = document.getElementById('app');
const dehydratedState = window.__DATA__;

function render(context, Handler) {
  React.render(React.createElement(
    FluxibleComponent,
    { context: context.getComponentContext() },
    React.createElement(Handler)
  ), mountNode);
}

function createAppRouter(context) {
  const router = Router.create({
    routes,
    location: Router.HistoryLocation,
    transitionContext: context,
  });
  app.getPlugin('RouterPlugin').setRouter(router);
  return router;
}

function startApp(firstRender, context, Handler, routerState, toggleFirstRender) {
  // If first render, we already have all the data rehydrated so skip fetch
  if (firstRender) {
    bootstrapDebug('First render, skipping data fetch');
    render(context, Handler);
    toggleFirstRender();
    return;
  }

  // On the client, we render the route change immediately
  // and fetch data in the background
  // (stores will update and trigger a re-render with new data)
  render(context, Handler);
  fetchData(context, routerState);
  return;
}

if (!dehydratedState) {
  bootstrapDebug('Isomorphism disabled, creating new context');
  const config = window.__CONFIG__;
  const context = app.createContext({ config });

  // For debugging
  window.context = context;
  bootstrapDebug('Loading session');

  context.getActionContext().executeAction(loadSession, {}, () => {
    const router = createAppRouter(context);
    bootstrapDebug('Starting router');
    router.run((Handler, routerState) => {
      render(context, Handler);
      fetchData(context, routerState);
    });
  });
} else {
  bootstrapDebug('Rehydrating app');
  app.rehydrate(dehydratedState, (err, context) => {
    if (err) {
      throw err;
    }

    // For debugging
    window.context = context;

    const AuthStore = require('../main/stores/AuthStore');
    const getAuthorityList = require('../main/authority/actions/getAuthorityList');
    const router = createAppRouter(context);
    let firstRender = true;

    bootstrapDebug('Starting router');

    router.run((Handler, routerState) => {
      // TODO: prepare the authority plugin on server side
      const isAuthenticated = context.getStore(AuthStore).isAuthenticated();
      const authority = context.getComponentContext().getAuthority();

      if (isAuthenticated && _.isNull(authority.getCarrierId())) {
        context.executeAction(getAuthorityList, routerState.params.identity, getAuthErr => {
          if (getAuthErr) {
            router.transitionTo('/error/internal-server-error');
            return;
          }

          startApp(firstRender, context, Handler, routerState, () => {
            firstRender = false;
          });
        });
      } else {
        startApp(firstRender, context, Handler, routerState, () => {
          firstRender = false;
        });
      }
    });
  });
}
