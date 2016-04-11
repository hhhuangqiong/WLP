import { isFunction } from 'lodash';
import React from 'react';
import Fluxible from 'fluxible';
import FluxContext from 'fluxible/lib/FluxibleContext';
import { FluxibleComponent } from 'fluxible-addons-react';

const debug = require('debug')('app:utils/fluxible');

/**
 * @method createContext
 * this method will be used on CLIENT SIDE ONLY,
 * to create proper context with different dehydratedState,
 * as context on client-side depends on dehydrated state
 *
 * @param app {Fluxible} Fluxible instance
 * @param dehydratedState
 * @param options {Object} the option object to be passed into app.createContext
 * @param options.req {Object} Express request object
 * @param options.res {Object} Express response object
 * @param options.config {Object} config object
 * @param cb {Function}
 *
 * @throws Will throw error if cb argument is missing or it is not a function
 */
export function createContext(app, state, options, cb) {
  if (!cb || !isFunction(cb)) {
    throw new Error('missing cb or cb is not a function');
  }

  if (!app || !(app instanceof Fluxible)) {
    // TODO: refine Error
    cb(new Error('missing Fluxible instance'));
    return;
  }

  if (!state) {
    debug('universal javascript disabled, creating new context');

    try {
      const context = app.createContext(options);
      cb(null, context);
    } catch (err) {
      // TODO: refine Error
      cb(err);
    }

    return;
  }

  debug('universal javascript enabled, rehydrating app context');

  try {
    app.rehydrate(state, cb);
  } catch (err) {
    // TODO: refine Error
    cb(err);
  }
}

/**
 * @method createMarkupElement
 * to create the toppest ReactElement for a Fluxible application.
 * This can be used in both client and server
 *
 * @param context {FluxContext} FluxContext instance
 * @param children {ReactElement} ReactElement as children, either
 * RoutingContext on server-side or Router Element on client-side
 * @returns {ReactElement}
 * @throws will throw error if context argument is not provided
 * @throws will throw error if context is not Fluxible context
 * @throws will throw error if children argument is not provided
 * @see {@link https://github.com/yahoo/fluxible/tree/master/examples/react-router}
 */
export function createMarkupElement(context, children) {
  if (!context) {
    throw new Error('missing FluxContext');
  }

  if (!(context instanceof FluxContext)) {
    throw new Error('invalid context instance');
  }

  if (!children || !React.isValidElement(children)) {
    throw new Error('missing ReactElement');
  }

  try {
    const element = React.createElement(
      FluxibleComponent,
      { context: context.getComponentContext() },
      children,
    );

    return element;
  } catch (err) {
    throw err;
  }
}
