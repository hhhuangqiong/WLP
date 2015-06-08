import React from 'react';
import { Route, NotFoundRoute, Redirect, DefaultRoute } from 'react-router';

// convention: separate path by "-" following the component name
export default (
  <Route handler={require('./components/App')}>

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
        <Route name="company-create" path="create" handler={require('./components/CompanyNewProfile')} />
        <Route name="company-profile" path=":carrierId/profile" handler={require('./components/CompanyProfile')} />
        <Route name="company-service" path=":carrierId/service" handler={require('./components/CompanyService')} />
        <Route name="company-widget" path=":carrierId/widget" handler={require('./components/CompanyWidget')} />
      </Route>
      <Route name="accounts" path="/:role/:identity?/accounts" handler={require('./components/Overview')} />
      <Route name="end-users" path="/:role/:identity?/endusers" handler={require('./components/EndUsers')} />
      <Route name="sms-overview" path="/:role/:identity?/sms" handler={require('./components/SMSOverview')} />
      <Route name="sms-details" path="/:role/:identity?/sms/details" handler={require('./components/SMS')} />
      <Route name="settings" path="/:role/:identity?/settings" handler={require('./components/Overview')} />
      <Route name="top-up" path="/:role/:identity?/top-up" handler={require('./components/TopUp')} />
      <Route name="calls-overview" path="/:role/:identity?/calls" handler={require('./components/CallsOverview')} />
      <Route name="calls-details" path="/:role/:identity?/calls/details" handler={require('./components/Calls')} />
      <Route name="im-overview" path="/:role/:identity?/im" handler={require('./components/ImOverview')} />
      <Route name="im" path="/:role/:identity?/im/details" handler={require('./components/Im')} />
      <Route name="vsf" path="/:role/:identity?/vsf" handler={require('./components/Overview')} />

      // keep this name until we are sure of making use of 'overview' above
      <Route name="main" handler={require('./components/Overview')}/>
    </Route>

    // shared by both "public" &amp; "protected"
    <NotFoundRoute name="not-found" handler={require('./components/common/NotFound')}/>
  </Route>
);
