import React from 'react';
import { Route, NotFoundRoute, Redirect, DefaultRoute } from 'react-router';

export default (
  <Route path="/" handler={require('./components/App')}>
    // public pages, for readability, please use '-'
    <Route name="about" handler={require('./components/About')}/>
    <Route name="forget-password" handler={require('./components/ForgetPassword')}/>
    <Route name="sign-in" handler={require('./components/SignIn')}/>

    // protected page
    <Route name="overview" path="/:role/:identity?/overview" handler={require('./components/Overview')}/>
    <Route name="companies" path="/:role/:identity?/companies" handler={require('./components/Companies')}>
      <Route name="company" path=":companyCarrierId" handler={require('./components/Company')}/>
    </Route>
    <Route name="end-users" path="/:role/:identity?/endusers" handler={require('./components/EndUsers')}>
      <Route name="end-user" path=":username" handler={require('./components/EndUserProfile')}/>
    </Route>
    <Route name="temp" handler={require('./components/common/TemporaryMain')}/>
    <Redirect from="/" to="temp" />
    <NotFoundRoute name="not-found" handler={require('./components/common/NotFound')}/>
  </Route>
);
