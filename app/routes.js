import React from 'react';
import { Route, NotFoundRoute, Redirect, DefaultRoute } from 'react-router';

// convention: separate path by "-" following the component name
export default (
  <Route handler={require('./components/App')}>
    <Redirect from="/" to="sign-in" />

    // public pages,
    <Route handler={require('./components/common/Public')}>
      <Route name="sign-in" handler={require('./components/SignIn')}/>
    </Route>

    <Route handler={require('./components/common/Protected')}>
      <Route name="calls" path="/:role/:identity?/calls" handler={require('./components/Calls')} />
      <Route name="im" path="/:role/:identity?/im" handler={require('./components/Im')} />
    </Route>

    // shared by both "public" &amp; "protected"
    <NotFoundRoute name="not-found" handler={require('./components/common/NotFound')}/>
  </Route>
);
