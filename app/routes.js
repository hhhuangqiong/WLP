import React from 'react';
import { Route, NotFoundRoute, Redirect, DefaultRoute } from 'react-router';

export default (
  <Route path="/" handler={require('./components/App')}>
    // public pages, for readability, please use '-'
    <Route name="about" handler={require('./components/About')}/>
    <Route name="forget-password" handler={require('./components/ForgetPassword')}/>
    <Route name="sign-in" handler={require('./components/SignIn')}/>;

    // protected pages
    <Route name=":role/:identity?/companies" handler={require('./components/Companies')}/>
    <Route name="end-users" path="/:identity/:carrierId/endusers" handler={require('./components/EndUsers')}/>;
    <Route name="end-user" path=":username" handler={require('./components/EndUserProfile')}/>
    <Route name="tempmain" handler={require('./components/common/TemporaryMain')}/>
    <Redirect from="/" to="tempmain" />
    <NotFoundRoute name="not-found" handler={require('./components/common/NotFound')}/>
  </Route>
);

