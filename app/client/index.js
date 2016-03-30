import Q from 'q';
import React from 'react';
import ReactDOM from 'react-dom';
import { Router, browserHistory } from 'react-router';

import app from '../app';
import config from '../config';
import { isDev } from '../utils/env';
import { createContext, createMarkupElement } from '../utils/fluxible';

const debug = require('debug');
const bootstrapDebug = debug('app:client');

// enable it only for development
if (isDev()) {
  // expose to window to make it configurable on browser console
  window.debug = debug;

  // for dev tool support
  window.React = React;
}

let { GLOBAL_DATA_VARIABLE } = config;

if (!GLOBAL_DATA_VARIABLE) {
  bootstrapDebug('GLOBAL_DATA_VARIABLE is missing, use __DATA__ by default');
  GLOBAL_DATA_VARIABLE = '__DATA__';
}

const mountNode = document.getElementById('app');
const dehydratedState = window[GLOBAL_DATA_VARIABLE];
const contextOptions = { config };

Q.nfcall(createContext, app, dehydratedState, contextOptions)
  .then(context => {
    // TODO: unsure why it loaded session without dehydratedState
    // it should be placed inside a container component instead
    const children = React.createElement(Router, {
      routes: context.getComponent(),
      history: browserHistory,
    });

    const markupElement = createMarkupElement(context, children);
    ReactDOM.render(markupElement, mountNode);
  })
  .catch(err => {
    throw err;
  });
