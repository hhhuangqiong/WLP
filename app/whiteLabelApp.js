'use strict';
import Fluxible from 'fluxible';
import React from 'react';

import Application from 'app/components/Application';

import ApplicationStore from 'app/stores/ApplicationStore';
import TimeStore from 'app/stores/TimeStore';
import PageStore from 'app/stores/PageStore';

import routes from 'app/config/routes';

import routrPlugin from 'fluxible-plugin-routr';

var app = new Fluxible({
  component: React.createFactory(Application)
});

app.plug(routrPlugin({
  routes: routes
}));

app.registerStore(ApplicationStore);
app.registerStore(TimeStore);
app.registerStore(PageStore);

export default app;
