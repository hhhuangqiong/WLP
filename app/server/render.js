import React from 'react';
import Router from 'react-router';
import serialize from 'serialize-javascript';
import FluxibleComponent from 'fluxible/addons/FluxibleComponent';

import Html from '../components/Html';
import fetchData from '../utils/fetchData';
import routes from '../routes';

var debug = require('debug')('app:server:render');

/**
 * Return a function to render the (React) component matched by url
 *
 * The component rendered is wrapped by `FluxibleComponent`
 * and therefore have access to the `context` (ComponentContext)
 *
 * @param {Fluxible} app Fluxible instance
 * @return {function}
 */
export default function(app) {
  return function(context, location, cb) {
    var router = Router.create({
      routes: routes,
      location: location,
      transitionContext: context,
      onAbort: function(redirect) {
        cb({ redirect: redirect });
      },
      onError: function(err) {
        debug('Routing Error', err);
        cb(err);
      }
    });

    router.run(function(Handler, routerState) {
      if (routerState.routes[0].name === 'not-found') {
        var html = React.renderToStaticMarkup(React.createElement(Handler));
        cb({ notFound: true }, html);
        return;
      }

      fetchData(context, routerState, function(err) {
        if (err) {
          // triggered by `onError` above? recoverable?
          return cb(err);
        }

        var dehydratedState = 'window.__DATA__=' + serialize(app.dehydrate(context)) + ';';
        var appMarkup = React.renderToString(React.createElement(
          FluxibleComponent, {
            // only expose `getStore()`
            context: context.getComponentContext()
          },
          React.createElement(Handler)
        ));
        var html = React.renderToStaticMarkup(React.createElement(Html, {
          state: dehydratedState,
          markup: appMarkup
        }));

        cb(null, html);
      });
    });
  }
}

