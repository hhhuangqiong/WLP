import React from 'react';
import Fluxible from 'fluxible';
import fetchrPlugin from 'fluxible-plugin-fetchr';
import { RouteStore } from 'fluxible-router';

import Application from './components/Application';

import ApplicationStore from './stores/ApplicationStore';
import TimeStore from './stores/TimeStore';
import PageStore from './stores/PageStore';
import CompanyStore from './stores/CompanyStore';

import routes from './config/routes';

// not sure about how this plug in help; keep for future reference
//import routrPlugin from 'fluxible-plugin-routr';

var app = new Fluxible({
  component: Application
});

// fluxible-plugin-fetchr requires a path for accessing RESTful service
// default and examples use `/api` which has been occupied by making MUMS/BOSS API calls
// so arbitrarily take `/fetchr`
app.plug(fetchrPlugin({
  xhrPath: '/fetchr'
}));

//app.plug(routrPlugin({
  //routes: routes
//}));

app.registerStore(RouteStore.withStaticRoutes(routes));
app.registerStore(ApplicationStore);
app.registerStore(CompanyStore);
app.registerStore(PageStore);
app.registerStore(TimeStore);

export default app;
