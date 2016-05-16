import React from 'react';
import { Route, IndexRedirect } from 'react-router';

import App from './main/components/common/App';
import Public from './main/components/common/Public';
import SignIn from './modules/sign-in/container';
import ForgotPassword from './modules/account/components/ForgotPassword';
import CreatePassword from './modules/account/components/CreatePassword';

import Protected from './main/components/common/Protected';

import Companies from './modules/company/components/Companies';
import { NewProfile, EditProfile } from './modules/company/components/Profile';
import Service from './modules/company/components/Service';

import Account from './modules/account/components/Account';
import AccountProfile from './modules/account/components/AccountProfile';
import Verification from './modules/verification/components/Verification';
import VerificationOverview from './modules/verification/components/VerificationOverview';
import VerificationDetails from './modules/verification/components/VerificationDetails';

import VsfOverview from './modules/vsf/components/overview/Overview';
import VsfDetails from './modules/vsf/components/VsfDetails';

import Overview from './modules/overview/components/Overview';
import CallsOverview from './modules/calls/components/CallsOverview';
import Calls from './modules/calls/components/Calls';
import EndUsersOverview from './modules/end-user/components/EndUsersOverview';
import EndUsersDetails from './modules/end-user/components/EndUsersDetails';
import ImOverview from './modules/im/components/Overview';
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

import AuthStore from './main/stores/AuthStore';
// import InitialDataStore from './main/stores/InitialDataStore';

const debug = require('debug')('app:routes');

export default (context) => {
  function requireAuth(nextState, replace, cb) {
    const isAuthenticated = context.getStore(AuthStore).isAuthenticated();

    if (!isAuthenticated) {
      debug('user is not authenticated, redirecting to /sign-in');
      replace('/sign-in');
    }

    // TODO: implementation on client side
    // const isDataLoaded = context.getStore(InitialDataStore).isDataLoaded();
    // run getInitialRequest

    cb();
  }

  function alreadyAuth(nextState, replace, cb) {
    const isAuthenticated = context.getStore(AuthStore).isAuthenticated();

    if (isAuthenticated) {
      try {
        const path = context.getStore(AuthStore).getLandingPath();
        debug('user is already authenticated, redirecting to landing page %s', path);
        replace(path);
      } catch (err) {
        debug('error occurred when getting landing path', err);
        debug('redirecting to /sign-in');
        replace('/sign-in');
      }
    }

    cb();
  }

  return (
    <Route path="/" component={App}>
      <IndexRedirect from="/" to="sign-in" />

      <Route component={Public}>
        <Route path="sign-in" component={SignIn} onEnter={alreadyAuth} />
        <Route path="forgot-password" component={ForgotPassword} />
        <Route path="verify/sign-up" component={CreatePassword} />
      </Route>

      <Route component={Protected} onEnter={requireAuth} >
        <Route path=":role/:identity" component={Overview} />

        <Route path=":role/:identity/companies" component={Companies}>
          <Route path="create" component={NewProfile} />
          <Route path=":carrierId/profile" component={EditProfile} />
          <Route path=":carrierId/service" component={Service} />
        </Route>

        <Route path=":role/:identity/account" component={Account}>
          <Route path="create" component={AccountProfile} />
          <Route path=":accountId" component={AccountProfile} />
        </Route>

        <Route component={Verification}>
          <Route path=":role/:identity/verification/overview" component={VerificationOverview} />
          <Route path=":role/:identity/verification/details" component={VerificationDetails} />
        </Route>

        <Route path=":role/:identity/vsf/overview" component={VsfOverview} />
      <Route path=":role/:identity/vsf/details" component={VsfDetails} />

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
    </Route>
  );
};
