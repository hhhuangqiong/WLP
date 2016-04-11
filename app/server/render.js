import logger from 'winston';
import React from 'react';
import ReactDomServer from 'react-dom/server';
import { RouterContext, match } from 'react-router';
import serialize from 'serialize-javascript';

import Html from '../main/components/common/Html';
import { getRedirectPath } from '../utils/reactRouter';
import { createMarkupElement } from '../utils/fluxible';

/**
 * @method createHtmlElement
 *
 * @param config {String} serialized react-application-related configs
 * @param state {String} serialized state to be rehydrated
 * @param markupElement {ReactElement} the rendered ReactElement as output
 * @returns {ReactElement}
 */
export function createHtmlElement(config, state, markupElement) {
  const props = {
    config,
    state,
    markup: markupElement && ReactDomServer.renderToString(markupElement),
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

  const routes = app.getComponent();

  return function render(req, res, next) {
    match({ routes, location: req.url }, (matchingErr, redirectLocation, renderProps) => {
      if (matchingErr) {
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
          logger.debug(`redirection is detected, to: ${redirectTo}`);
          res.redirect(302, redirectTo);
        } catch (err) {
          next(err);
        }
        return;
      }

      if (renderProps) {
        // if renderProps is returned by react-router,
        // that means react-router hit a route
        const context = app.createContext({ req, res, config });
        const dehydratedContext = app.dehydrate(context);
        // eslint-disable-next-line max-len
        const dehydratedState = `window.${config.GLOBAL_DATA_VARIABLE}=${serialize(dehydratedContext)};`;
        const serializedConfig = `window.${config.GLOBAL_CONFIG_VARIABLE}=${serialize(config)};`;
        const children = React.createElement(RouterContext, renderProps);
        const markupElement = createMarkupElement(context, children);
        const htmlElement = createHtmlElement(serializedConfig, dehydratedState, markupElement);
        const html = ReactDomServer.renderToStaticMarkup(htmlElement);
        const htmlWithDocType = prependDocType(html);

        res.send(htmlWithDocType);
        return;
      }

      // TODO: refine Error
      next(new Error('not found'));
    });
  };
}
