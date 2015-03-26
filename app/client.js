/*global App, document, window */
'use strict';
import React from 'react';
import Router, {HistoryLocation} from 'react-router';

import app from 'app/whiteLabelApp';
import navigateAction from 'app/actions/navigate';

var debug = require('debug')('WhiteLabelPortal:MainStream');

var dehydratedState = window.App; // Sent from the server

window.React = React; // For chrome dev tool support

debug('rehydrating app');

function RenderApp(context, Handler){
  debug('React Rendering');

  var mountNode = document.getElementById('app');
  var Component = React.createFactory(Handler);
  React.render(Component({context:context.getComponentContext()}), mountNode, function () {
    debug('React Rendered');
  });
}

app.rehydrate(dehydratedState, function (err, context) {
  if (err) {
    throw err;
  }

  window.context = context;

  var firstRender = true;
  Router.run(app.getComponent(), HistoryLocation, function (Handler, state) {
    if (firstRender) {
      // Don't call the action on the first render on top of the server rehydration
      // Otherwise there is a race condition where the action gets executed before
      // render has been called, which can cause the checksum to fail.
      RenderApp(context, Handler);
      firstRender = false;
    } else {
      context.executeAction(navigateAction, state, function () {
        RenderApp(context, Handler);
      });
    }
  });
});
