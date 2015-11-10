import React from 'react';
import { Route, NotFoundRoute, Redirect, DefaultRoute } from 'react-router';
import { CLIENT } from './utils/env';

// path strings
import {
  ERROR_401 as pathToError401,
  ERROR_404 as pathToError404,
  ERROR500 as pathToError500
} from './server/paths';

// convention: separate path by "-" following the component name

// react-router acts differently from CLIENT to SERVER
// CLIENT side react-router could recognize `to` property as route name while
// SERVER side react-router takes to as URL
let redirectForCallsOverview = CLIENT ? 'calls-overview' : 'calls/overview';

export default (
  <Route handler={require('./main/components/common/App')}>
    <Redirect from="/" to="sign-in" />

    // public pages,
    <Route handler={require('./main/components/common/Public')}>
      <Route name="sign-in" handler={require('./main/components/SignIn')}/>
    </Route>

    <Route handler={require('./main/components/common/Protected')}>
      <Route name="companies" path="/:role/:identity?/companies" handler={require('./modules/company/components/Companies')}>
        <Route name="company-create" path="create" handler={require('./modules/company/components/Profile').NewProfile} />
        <Route name="company-profile" path=":carrierId/profile" handler={require('./modules/company/components/Profile').EditProfile} />
        <Route name="company-service" path=":carrierId/service" handler={require('./modules/company/components/Service')} />
        <Route name="company-widget" path=":carrierId/widget" handler={require('./modules/company/components/Widgets')} />
      </Route>

      <Route path="/:role/:identity?/verification" handler={require('./modules/verification/components/Verification')}>
        <DefaultRoute name="verification" handler={require('./modules/verification/components/VerificationOverview')} />
        <Route name="verification-details" path="details" handler={require('./modules/verification/components/VerificationDetails')} />
      </Route>

      <Redirect from="/:role/:identity?/calls" to={redirectForCallsOverview} />

      <Route name="vsf-transaction-overview" path="/:role/:identity?/vsf" handler={require('./modules/virtual-store-front/components/VSFTransactionOverview')} />
      <Route name="vsf-transaction-details" path="/:role/:identity?/vsf/details" handler={require('./modules/virtual-store-front/components/VSFTransactionDetails')} />

      <Route name="overview" path="/:role/:identity?/overview" handler={require('./modules/overview/components/Overview')} />

      <Route name="calls-overview" path="/:role/:identity?/calls/overview" handler={require('./modules/calls/components/CallsOverview')} />
      <Route name="calls-details" path="/:role/:identity?/calls/details" handler={require('./modules/calls/components/Calls')} />

      <Route name="end-users" path="/:role/:identity?/end-users" handler={require('./modules/end-user/components/EndUsers')} />

      <Route name="im-overview" path="/:role/:identity?/im" handler={require('./modules/im/components/ImOverview')} />
      <Route name="im" path="/:role/:identity?/im/details" handler={require('./modules/im/components/Im')} />

      <Route name="sms-overview" path="/:role/:identity?/sms" handler={require('./modules/sms/components/Overview')} />
      <Route name="sms-details" path="/:role/:identity?/sms/details" handler={require('./modules/sms/components/SMS')} />

      <Route name="top-up-details" path="/:role/:identity?/top-up/details" handler={require('./modules/top-up/components/TopUp')} />
    </Route>

    // shared by both "public" &amp; "protected"
    <Route name="access-denied" path={pathToError401} handler={require('./main/components/Errors').Error401} />
    <Route name="internal-server-error" path={pathToError500} handler={require('./main/components/Errors').Error500} />

    <NotFoundRoute name="not-found" handler={require('./main/components/Errors').Error404} />
  </Route>
);
