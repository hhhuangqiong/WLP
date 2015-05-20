import React from 'react';
import { Route, NotFoundRoute, Redirect, DefaultRoute } from 'react-router';

// convention: separate path by "-" following the component name
export default (
  <Route handler={require('./components/App')}>
    <Redirect from="/" to="main" />

    // placeholder for not-yet-complete components/link
    <Route name="TODO" handler={require('./components/_TODO')}/>

    // public pages,
    <Route handler={require('./components/common/Public')}>
      <Route name="forget-password" handler={require('./components/ForgetPassword')}/>
      <Route name="sign-in" handler={require('./components/SignIn')}/>
    </Route>

    <Route handler={require('./components/common/Protected')}>
      <Route name="overview" path="/:role/:identity?/overview" handler={require('./components/Overview')}/>
      <Route name="companies" path="/:role/:identity?/companies" handler={require('./components/Companies')}>
        <Route name="company-create" path="create" handler={require('./components/Company')} />
        <Route name="company" path=":carrierId/:subPage" handler={require('./components/Company')} />
      </Route>
      <Route name="accounts" path="/:role/:identity?/accounts" handler={require('./components/Overview')} />
      <Route name="end-users" path="/:role/:identity?/endusers" handler={require('./components/EndUsers')}>
        <Route name="end-user" path=":username" handler={require('./components/EndUserProfile')}/>
      </Route>
      <Route name="settings" path="/:role/:identity?/settings" handler={require('./components/Overview')} />
      <Route name="top-up" path="/:role/:identity?/top-up" handler={require('./components/Overview')} />
      <Route name="calls" path="/:role/:identity?/calls" handler={require('./components/Calls')} />
      <Route name="im" path="/:role/:identity?/im" handler={require('./components/Overview')} />
      <Route name="vsf" path="/:role/:identity?/vsf" handler={require('./components/Overview')} />

      // keep this name until we are sure of making use of 'overview' above
      <Route name="main" handler={require('./components/Overview')}/>
    </Route>

    // shared by both "public" & "protected"
    <NotFoundRoute name="not-found" handler={require('./components/common/NotFound')}/>
  </Route>
);
