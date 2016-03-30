import React from 'react';
import { Route, NotFoundRoute, IndexRoute, IndexRedirect } from 'react-router';

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
  ERROR_401 as path401,
  ERROR_404 as path404,
  ERROR_500 as path500,
} from './server/paths';

// convention: separate path by "-" following the component name

export default (
  <Route path="/" component={App}>
    <IndexRedirect from="/" to="sign-in" />

    <Route component={Public}>
      <Route path="sign-in" component={SignIn} />
      <Route path="forgot-password" component={ForgotPassword} />
      <Route path="create-password" path="verify/sign-up" component={CreatePassword} />
    </Route>

    <Route component={Protected}>
      <Route path=":role/:identity/overview" component={Overview} />

      <Route path=":role/:identity/companies" component={Companies}>
        <Route name="company-create" path="create" component={NewProfile} />
        <Route name="company-profile" path=":carrierId/profile" component={EditProfile} />
        <Route name="company-service" path=":carrierId/service" component={Service} />
        <Route name="company-widget" path=":carrierId/widget" component={Widgets} />
      </Route>

      <Route path=":role/:identity/account" component={Account}>
        <Route name="account-create" path="create" component={AccountProfile} />
        <Route name="account-profile" path=":accountId" component={AccountProfile} />
      </Route>

      <Route path=":role/:identity/verification" component={Verification}>
        <Route path="/overview" component={VerificationOverview} />
        <Route path="/details" component={VerificationDetails} />
      </Route>

      <Route path=":role/:identity/vsf/overview" component={VSFTransactionOverview} />
      <Route path=":role/:identity/vsf/details" component={VSFTransactionDetails} />

      <Route path=":role/:identity/calls/overview" component={CallsOverview} />
      <Route path=":role/:identity/calls/details" component={Calls} />

      <Route path=":role/:identity/end-users/overview" component={EndUsersOverview} />
      <Route path=":role/:identity/end-users/details" component={EndUsersDetails} />

      <Route path=":role/:identity/im/overview" component={ImOverview} />
      <Route path=":role/:identity/im/details" component={Im} />

      <Route path=":role/:identity/sms/overview" component={SmsOverview} />
      <Route path=":role/:identity/sms/details" component={SMS} />

      <Route path=":role/:identity/top-up/details" component={TopUp} />
    </Route>

    <Route path={path401} component={Error401} />
    <Route path={path404} component={Error404} />
    <Route path={path500} component={Error500} />

    <Route path="*" component={Error404} />
  </Route>
);
