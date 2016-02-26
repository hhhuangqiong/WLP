import React from 'react';
import { Route, NotFoundRoute, Redirect, DefaultRoute } from 'react-router';

import App from './main/components/common/App';
import Public from './main/components/common/Public';
import SignIn from './main/components/SignIn';
import ForgotPassword from './modules/account/components/ForgotPassword';
import CreatePassword from './modules/account/components/CreatePassword';

import Protected from './main/components/common/Protected';

import Companies from './modules/company/components/Companies';
import { NewProfile, EditProfile } from './modules/company/components/Profile';
import Service from './modules/company/components/Service';
import Widgets from './modules/company/components/Widgets';

import Account from './modules/account/components/Account';
import AccountProfile from './modules/account/components/AccountProfile';
import Verification from './modules/verification/components/Verification';
import VerificationOverview from './modules/verification/components/VerificationOverview';
import VerificationDetails from './modules/verification/components/VerificationDetails';

import
  VSFTransactionOverview
from './modules/virtual-store-front/components/VSFTransactionOverview';

import VSFTransactionDetails from './modules/virtual-store-front/components/VSFTransactionDetails';
import Overview from './modules/overview/components/Overview';
import CallsOverview from './modules/calls/components/CallsOverview';
import Calls from './modules/calls/components/Calls';
import EndUsersOverview from './modules/end-user/components/EndUsersOverview';
import EndUsersDetails from './modules/end-user/components/EndUsersDetails';
import ImOverview from './modules/im/components/ImOverview';
import Im from './modules/im/components/Im';
import SmsOverview from './modules/sms/components/Overview';
import SMS from './modules/sms/components/SMS';
import TopUp from './modules/top-up/components/TopUp';

import {
  Error401,
  Error404,
  Error500,
} from './main/components/Errors';

// path strings
import {
  ERROR_401 as pathToError401,
  ERROR500 as pathToError500,
} from './server/paths';

// convention: separate path by "-" following the component name

export default (
  <Route handler={App}>
    <Redirect from="/" to="sign-in" />

    // public pages,
    <Route handler={Public}>
      <Route name="sign-in" handler={SignIn} />
      <Route name="forgot-password" handler={ForgotPassword} />
      <Route name="create-password" path="verify/sign-up" handler={CreatePassword} />
    </Route>

    <Route handler={Protected}>
      <Route name="companies" path="/:role/:identity?/companies" handler={Companies}>
        <Route name="company-create" path="create" handler={NewProfile} />
        <Route name="company-profile" path=":carrierId/profile" handler={EditProfile} />
        <Route name="company-service" path=":carrierId/service" handler={Service} />
        <Route name="company-widget" path=":carrierId/widget" handler={Widgets} />
      </Route>
      <Route name="account" path="/:role/:identity?/account" handler={Account}>
        <Route name="account-create" path="create" handler={AccountProfile} />
        <Route name="account-profile" path=":accountId" handler={AccountProfile} />
      </Route>
      <Route path="/:role/:identity?/verification" handler={Verification}>
        <DefaultRoute name="verification" handler={VerificationOverview} />
        <Route name="verification-details" path="details" handler={VerificationDetails} />
      </Route>

      <Route
        name="vsf-transaction-overview"
        path="/:role/:identity?/vsf"
        handler={VSFTransactionOverview}
      />

      <Route
        name="vsf-transaction-details"
        path="/:role/:identity?/vsf/details"
        handler={VSFTransactionDetails}
      />

      <Route name="overview" path="/:role/:identity?/overview" handler={Overview} />

      <Route name="calls-overview" path="/:role/:identity?/calls" handler={CallsOverview} />
      <Route name="calls-details" path="/:role/:identity?/calls/details" handler={Calls} />

      <Route
        name="end-users-overview" path="/:role/:identity?/end-users" handler={EndUsersOverview}
      />

      <Route
        name="end-users-details"
        path="/:role/:identity?/end-users/details"
        handler={EndUsersDetails}
      />

      <Route name="im-overview" path="/:role/:identity?/im" handler={ImOverview} />
      <Route name="im" path="/:role/:identity?/im/details" handler={Im} />

      <Route name="sms-overview" path="/:role/:identity?/sms" handler={SmsOverview} />
      <Route name="sms-details" path="/:role/:identity?/sms/details" handler={SMS} />

      <Route name="top-up-details" path="/:role/:identity?/top-up/details" handler={TopUp} />
    </Route>

    // shared by both "public" &amp; "protected"
    <Route name="access-denied" path={pathToError401} handler={Error401} />
    <Route name="internal-server-error" path={pathToError500} handler={Error500} />

    <NotFoundRoute name="not-found" handler={Error404} />
  </Route>
);
