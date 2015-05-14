import React from 'react';
import { Route, NotFoundRoute, Redirect } from 'react-router';

export default (
  <Route path="/" handler={require('./components/App')}>
    <Route name="about" handler={require('./components/About')}/>;
    <Route name="signin" handler={require('./components/SignIn')}/>;
    <Route name="companies" handler={require('./components/Companies')}/>;
    <Route name="temp" handler={require('./components/common/TemporaryMain')}/>;
    <Redirect from="/" to="temp" />
    <NotFoundRoute name="not-found" handler={require('./components/common/NotFound')}/>
  </Route>
);

