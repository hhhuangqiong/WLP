import Q from 'q';
import store from 'store';
import React from 'react';
import ReactDOM from 'react-dom';
import { Router, browserHistory } from 'react-router';
import { IntlProvider, addLocaleData } from 'react-intl';

import app from '../app';
import config from '../config';
import { isDev } from '../utils/env';
import { createContext, createMarkupElement } from '../utils/fluxible';
import getRoutes from '../routes';

const debug = require('debug');
const bootstrapDebug = debug('app:client');

const locales = config.LOCALES;

if (!locales) {
  throw new Error('Locale config LOCALES is missing');
}

locales.forEach(locale => {
  const lang = locale.split('-')[0];
  debug(`locale option ${locale} is detected, injecting ${locale} locale data`);
  addLocaleData(require(`react-intl/locale-data/${lang}`));
});

// enable it only for development
if (isDev()) {
  // expose to window to make it configurable on browser console
  window.debug = debug;

  // for dev tool support
  window.React = React;
}

let { GLOBAL_DATA_VARIABLE, GLOBAL_LOCALE_VARIABLE } = config;

if (!GLOBAL_DATA_VARIABLE) {
  bootstrapDebug('GLOBAL_DATA_VARIABLE is missing, use __DATA__ by default');
  GLOBAL_DATA_VARIABLE = '__DATA__';
}

if (!GLOBAL_LOCALE_VARIABLE) {
  bootstrapDebug('GLOBAL_LOCALE_VARIABLE is missing, use __LOCALE__ by default');
  GLOBAL_LOCALE_VARIABLE = '__LOCALE__';
}

const mountNode = document.getElementById('app');
const dehydratedState = window[GLOBAL_DATA_VARIABLE];
const contextOptions = { config };
const messages = window[GLOBAL_LOCALE_VARIABLE];

Q.nfcall(createContext, app, dehydratedState, contextOptions)
  .then(context => {
    const routes = getRoutes(context);

    let children = React.createElement(Router, {
      routes,
      history: browserHistory,
    });

    debug('Localization: wrapping Router Component with IntlProvider Component');
    // assuming that value in localStorage has higher priority
    // than the lang attribute from server
    const locale = store.get('locale') || document.documentElement.getAttribute('lang');
    children = React.createElement(IntlProvider, { locale, messages }, children);


    const markupElement = createMarkupElement(context, children);
    ReactDOM.render(markupElement, mountNode);
  })
  .catch(err => {
    throw err;
  });
