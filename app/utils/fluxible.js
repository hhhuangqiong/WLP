import Q from 'q';
import { isArray, isEmpty, isFunction, reduce } from 'lodash';
import { ArgumentNullError, TypeError } from 'common-errors';
import React, { PropTypes } from 'react';
import Fluxible from 'fluxible';
import FluxContext from 'fluxible/lib/FluxibleContext';
import { FluxibleComponent, provideContext } from 'fluxible-addons-react';
import AuthorityChecker from '../modules/authority/plugin';

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
      provideContext(FluxibleComponent, {
        getStore: PropTypes.func,
        executeAction: PropTypes.func,
        // custom context(s)
        authorityChecker: PropTypes.instanceOf(AuthorityChecker),
      }),
      { context: context.getComponentContext() },
      children,
    );

    return element;
  } catch (err) {
    throw err;
  }
}

/**
 * @method getInitialData
 * to fetch the initial data with Fluxible. Actions SHOULD BE
 * the processes only that are essential for starting the application.
 * Be aware that getting initial data does not involve `payload` object,
 * enforcing that all the related processes can only be user
 * session related.
 *
 * @param context {FluxContext}
 * @param actions {Array} array of actions
 * @param params.req {Object} express req
 * @param params.res {Object} express res
 * @param params.config {Object} application configuration
 * @param cb {Function}
 */
export function getInitialData(context, actions, params, cb) {
  if (!context) {
    throw new ArgumentNullError('context');
  }

  if (!(context instanceof FluxContext)) {
    throw new TypeError('`context` is not a FluxContext');
  }

  if (!isArray(actions)) {
    throw new TypeError('`actions` is not an array');
  }

  if (!cb) {
    throw new ArgumentNullError('cb');
  }

  if (!isFunction(cb)) {
    throw new TypeError('`cb` is not a function');
  }

  const actionContext = context.getActionContext();

  Q.all(actions.map(action => (Q.ninvoke(actionContext, 'executeAction', action, params))))
    .then(data => {
      debug('initial request is done, updating InitialDataStore', data);
      actionContext.dispatch('INITIAL_DATA_FETCHED');

      // most of the time the dehydrated process
      // does not need to return the data as the data
      // is already put into stores.
      cb(null, data);
    })
    .catch(err => {
      debug('error occurred in getInitialData()', err);
      cb(err);
    });
}
