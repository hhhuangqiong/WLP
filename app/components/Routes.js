import React from 'react';
import {Route, DefaultRoute, NotFoundRoute} from 'react-router';

import Application from 'app/components/Application';
import Home from 'app/components/Home';
import About from 'app/components/About';

var routes = (
  <Route name="app" path="/" handler={Application}>
    <Route name="about" handler={About}/>
    <DefaultRoute name="home" handler={Home}/>
  </Route>
);

export default routes;
