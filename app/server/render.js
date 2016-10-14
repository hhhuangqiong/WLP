import Q from 'q';
import url from 'url';
import validator from 'validator';
import path from 'path';
import logger from 'winston';
import _ from 'lodash';
import React from 'react';
import ReactDomServer from 'react-dom/server';
import { RouterContext, match } from 'react-router';
import serialize from 'serialize-javascript';
import { IntlProvider } from 'react-intl';

import Html from '../main/components/common/Html';
import getRoutes from '../routes';
import { getRedirectPath } from '../utils/reactRouter';
import { createMarkupElement, getInitialData } from '../utils/fluxible';
import { getLocaleDataFromPath } from '../utils/intl';
import { setLocale } from '../utils/dateLocale';
import { SIGN_IN } from '../utils/paths';

import getClientConfig from './actions/getClientConfig';
import loadSession from './actions/loadSession';
import getAccessibleCompanies from './actions/getAccessibleCompanies';
import setUserLanguage from './actions/setUserLanguage';
import fetchCurrentCompanyInfo from './actions/fetchCurrentCompanyInfo';

/**
 * @method createHtmlElement
 *
 * @param state {String} serialized state to be rehydrated
 * @param markupElement {ReactElement} the rendered ReactElement as output
 * @param options {Object} object of serialized strings
 * @returns {ReactElement}
 */
export function createHtmlElement(state, markupElement, options) {
  const props = {
    state,
    markup: markupElement && ReactDomServer.renderToString(markupElement),
    ...options,
  };
  const element = React.createElement(Html, props);
  return element;
}

/**
 * @method prependDocType
 * to prepend the html DOCTYPE string to a html string which is rendered
 * as string from jsx syntax which does not allow DOCTYPE
 *
 * @param html {String} html markup string
 * @returns {String}
 */
export function prependDocType(html) {
  return `<!DOCTYPE html>${html}`;
}

/**
 * @method renderer
 * this is an Express middleware to handle the process of
 * React + Fluxible + React Router application
 *
 * @param app {Fluxible}
 * @param config {Object} config object that will be set in Context
 */
export default function renderer(app, config) {
  if (!app) {
    throw new Error('Fluxible is missing');
  }

  return function render(req, res, next) {
    const context = app.createContext({ req, res, config });
    const routes = getRoutes(context);

    const initialActions = [
      loadSession,
      getAccessibleCompanies,
      setUserLanguage,
      fetchCurrentCompanyInfo,
      getClientConfig,
    ];

    // Carrier id will be passed as a separate payload parameter
    // As we should avoid passing req and res to fluxible actions directly if we want to be good guys
    const parts = url.parse(req.url).pathname.split('/');
    const carrierId = [
      parts[1],
      _.get(req, 'user.carrierId'),
    ].find(x => validator.isURL(x, { allow_underscores: true }));
    logger.debug(`Carrier id resolved by renderer: ${carrierId}.`);

    // it turns out that the server defines the
    // get initial data details by its own
    // which is not satisfying
    // could it be defined within the routes?
    // see: https://github.com/erikras/react-redux-universal-hot-example/blob/master/src%2Froutes.js#L27
    Q.nfcall(getInitialData, context, initialActions, { req, res, carrierId })
      .then(() => {
        match({ routes, location: req.url }, (matchingErr, redirectLocation, renderProps) => {
          if (matchingErr) {
            logger.debug('react-router route matching error occurred', matchingErr);
            // if error occurred during matching url with react-router,
            // it should response with internal server error
            next(matchingErr);
            return;
          }

          if (redirectLocation) {
            // if redirection is detected by react-router,
            // it should response with redirection
            try {
              const redirectTo = getRedirectPath(redirectLocation);
              // handling for ensure login, save the return to link
              // it will return back when finish the authorization,
              // it will be read in the passportjs
              if (redirectTo === SIGN_IN) {
                req.session.returnTo = req.originalUrl || req.url;
              }
              logger.debug(`redirection is detected, to: ${redirectTo}`);
              // ensure login handling
              res.redirect(302, redirectTo);
            } catch (err) {
              next(err);
            }
            return;
          }

          if (renderProps) {
            // if renderProps is returned by react-router,
            // that means react-router hit a route

            const dehydratedContext = app.dehydrate(context);
            /* eslint-disable max-len */
            const dehydratedState = `window.${config.GLOBAL_DATA_VARIABLE}=${serialize(dehydratedContext)};`;
            const serializedConfig = `window.${config.GLOBAL_CONFIG_VARIABLE}=${serialize(config)};`;
            /* eslint-enable max-len */

            let children = React.createElement(RouterContext, renderProps);

            // TODO: check and take locale preference from user session if available
            const locale = req.locale;
            setLocale(locale);
            logger.debug(`locale is set as ${locale}`);


            /* eslint-disable max-len */
            logger.debug('Localization is enabled, wrapping RouterContext Component with IntlProvider Component');
            const translations = getLocaleDataFromPath(path.resolve(__dirname, '../../public/locale-data'));
            const serializedLocale = `window.${config.GLOBAL_LOCALE_VARIABLE}=${serialize(translations[locale])};`;
            children = React.createElement(IntlProvider, { locale, messages: translations[locale] }, children);
            /* eslint-enable */

            const markupElement = createMarkupElement(context, children);
            const htmlElement = createHtmlElement(dehydratedState, markupElement, {
              lang: locale,
              config: serializedConfig,
              locale: serializedLocale,
            });
            const html = ReactDomServer.renderToStaticMarkup(htmlElement);
            const htmlWithDocType = prependDocType(html);

            res.send(htmlWithDocType);
            return;
          }

          // TODO: refine Error
          next(new Error('not found'));
        });
      })
      .catch(err => {
        logger.error(err);
        next(err);
      });
  };
}
