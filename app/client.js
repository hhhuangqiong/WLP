/*global App, document, window */
'use strict';
import React from 'react';
import Router, {HistoryLocation} from 'react-router';

import app from 'app/whiteLabelApp';

var debug = require('debug')('WhiteLabelPortal:MainStream');

var dehydratedState = window.App; // Sent from the server

window.React = React; // For chrome dev tool support

debug('rehydrating app');

function RenderApp(context){
  debug('React Rendering');

  let mountNode = document.getElementById('app');
  let Component = app.getComponent();
  React.render(Component({context:context.getComponentContext()}), mountNode, function () {
    debug('React Rendered');
  });
}

app.rehydrate(dehydratedState, function (err, context) {
  if (err) {
    throw err;
  }

  window.context = context;
  RenderApp(context);
});
