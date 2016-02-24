import React from 'react';
import { Route, NotFoundRoute, Redirect, DefaultRoute } from 'react-router';

// path strings
import {
  ERROR_401 as pathToError401,
  ERROR500 as pathToError500,
} from './server/paths';

// convention: separate path by "-" following the component name

export default (
  <Route handler={require('./main/components/common/App')}>
    <Redirect from="/" to="sign-in" />

    // public pages,
    <Route handler={require('./main/components/common/Public')}>
      <Route name="sign-in" handler={require('./main/components/SignIn')} />
      <Route name="forgot-password" handler={require('./modules/account/components/ForgotPassword')} />
      <Route name="create-password" path="verify/sign-up" handler={require('./modules/account/components/CreatePassword')} />
    </Route>

    <Route handler={require('./main/components/common/Protected')}>
      <Route name="companies" path="/:role/:identity?/companies" handler={require('./modules/company/components/Companies')}>
        <Route name="company-create" path="create" handler={require('./modules/company/components/Profile').NewProfile} />
        <Route name="company-profile" path=":carrierId/profile" handler={require('./modules/company/components/Profile').EditProfile} />
        <Route name="company-service" path=":carrierId/service" handler={require('./modules/company/components/Service')} />
        <Route name="company-widget" path=":carrierId/widget" handler={require('./modules/company/components/Widgets')} />
      </Route>

      <Route name="account" path="/:role/:identity?/account" handler={require('./modules/account/components/Account')}>
        <Route name="account-create" path="create" handler={require('./modules/account/components/AccountProfile')} />
        <Route name="account-profile" path=":accountId" handler={require('./modules/account/components/AccountProfile')} />
      </Route>

      <Route path="/:role/:identity?/verification" handler={require('./modules/verification/components/Verification')}>
        <DefaultRoute name="verification" handler={require('./modules/verification/components/VerificationOverview')} />
        <Route name="verification-details" path="details" handler={require('./modules/verification/components/VerificationDetails')} />
      </Route>

      <Route name="vsf-transaction-overview" path="/:role/:identity?/vsf" handler={require('./modules/virtual-store-front/components/VSFTransactionOverview')} />
      <Route name="vsf-transaction-details" path="/:role/:identity?/vsf/details" handler={require('./modules/virtual-store-front/components/VSFTransactionDetails')} />

      <Route name="overview" path="/:role/:identity?/overview" handler={require('./modules/overview/components/Overview')} />

      <Route name="calls-overview" path="/:role/:identity?/calls" handler={require('./modules/calls/components/CallsOverview')} />
      <Route name="calls-details" path="/:role/:identity?/calls/details" handler={require('./modules/calls/components/Calls')} />

      <Route name="end-users-overview" path="/:role/:identity?/end-users" handler={require('./modules/end-user/components/EndUsersOverview')} />
      <Route name="end-users-details" path="/:role/:identity?/end-users/details" handler={require('./modules/end-user/components/EndUsersDetails')} />

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
