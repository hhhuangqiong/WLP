import _ from 'lodash';
import React from 'react';
import Router from 'react-router';

import FluxibleComponent from 'fluxible/addons/FluxibleComponent';

import * as env from '../utils/env';

let debug = require('debug');

// make it disabled in default
debug.disable();

// enable it only for development
if (env.isDev()) {
  // need to be exposed to window so we can
  // config on browser console
  window.debug = debug;
  debug.enable('*');
}

let bootstrapDebug = debug('app:client');

// TODO rename the file as 'app'
import app from '../index';
import routes from '../routes';
import fetchData from '../utils/fetchData';
import loadSession from '../actions/loadSession';

window.React = React; // For chrome dev tool support

let mountNode = document.getElementById('app');
let dehydratedState = window.__DATA__;

function render(context, Handler) {
  React.render(React.createElement(
    FluxibleComponent,
    {context: context.getComponentContext()},
    React.createElement(Handler)
  ), mountNode);
}

function createAppRouter(context) {
  let router = Router.create({
    routes: routes,
    location: Router.HistoryLocation,
    transitionContext: context
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
  let context = app.createContext({config: config});

  // For debugging
  window.context = context;
  bootstrapDebug('Loading session');
  context.getActionContext().executeAction(loadSession, {}, function() {
    let router = createAppRouter(context);
    bootstrapDebug('Starting router');
    router.run(function(Handler, routerState) {
      render(context, Handler);
      fetchData(context, routerState);
    });
  });
} else {
  bootstrapDebug('Rehydrating app');
  app.rehydrate(dehydratedState, function(err, context) {
    if (err) {
      throw err;
    }

    // For debugging
    window.context = context;

    let AuthStore = require('../stores/AuthStore');
    let getAuthorityList = require('../main/authority/actions/getAuthorityList');
    let router = createAppRouter(context);
    let firstRender = true;

    bootstrapDebug('Starting router');

    router.run(function(Handler, routerState) {
      // TODO: prepare the authority plugin on server side
      let isAuthenticated = context.getStore(AuthStore).isAuthenticated();
      let authority = context.getComponentContext().getAuthority();
      if (isAuthenticated && _.isNull(authority.getCarrierId())) {
        context.executeAction(getAuthorityList, {}, function(err, { carrierId, capability }) {
          if (err) {
            router.transitionTo('/error/internal-server-error');
            return;
          }

          authority.reset(carrierId, capability);
          startApp(firstRender, context, Handler, routerState, function() {
            firstRender = false;
          });
        })
      } else {
        // this is to reset authority plugin upon logout
        // ideally it should be done in logout action
        // but action cannot access component context
        if (!isAuthenticated && !_.isNull(authority.getCarrierId())) {
          authority.reset();
        }

        startApp(firstRender, context, Handler, routerState, function() {
          firstRender = false;
        });
      }
    });
  });
}

