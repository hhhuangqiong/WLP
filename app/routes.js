import React from 'react';
import { Route, IndexRedirect } from 'react-router';
import modules from './constants/moduleId';

import App from './main/components/common/App';

import Protected from './main/components/common/Protected';
import Company from './modules/company/components/Company';
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
import WhitelistList from './modules/end-user/containers/Whitelist/List';
import WhitelistNew from './modules/end-user/containers/Whitelist/AddNew';
import ImOverview from './modules/im/components/Overview';
import Im from './modules/im/components/Im';
import SmsOverview from './modules/sms/components/Overview';
import SMS from './modules/sms/components/SMS';
import TopUp from './modules/top-up/components/TopUp';

import RolesTablePage from './modules/access-management/components/RolesPage';

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
} from './utils/paths';

import AuthStore from './main/stores/AuthStore';
import AuthorityStore from './modules/authority/store';

import { userPath } from './utils/paths';

const debug = require('debug')('app:routes');

export default (context) => {
  function checkAuth(nextState, replace, cb) {
    const isAuthenticated = context.getStore(AuthStore).isAuthenticated();

    if (!isAuthenticated) {
      debug('user is not authenticated, redirecting to /sign-in');
      replace('/sign-in');
      cb();
      return;
    }

    let role;
    let carrierId;

    // get the capability of the user
    const capability = context.getStore(AuthorityStore).getCapability();
    // get the authority checker
    const { authorityChecker } = context.getActionContext();
    // since it is in the root domain, it expects to get user role and carrier from the user info
    if (nextState.location.pathname === '/') {
      role = context.getStore(AuthStore).getUserRole();
      carrierId = context.getStore(AuthStore).getCarrierId();
      authorityChecker.reset(carrierId, capability);
    } else {
      // get the information from the params and check for the accessibility
      role = nextState.params.role;
      carrierId = nextState.params.identity;
      authorityChecker.reset(carrierId, capability);
      // user can access the path, no redirection needed
      if (authorityChecker.canAccessPath(nextState.location.pathname)) {
        debug('user is authorised to enter the page');
        cb();
        return;
      }
    }
    // when user hasn't define the page or enter the website at the first time,
    // it will get the default path and redirect to it
    const defaultPath = authorityChecker.getDefaultPath();
    const path = userPath(role, carrierId, defaultPath);
    debug(`user is already authenticated and redirect to ${defaultPath}`);
    replace(path);
    cb();
  }

  return (
    <Route path="/" component={App} onEnter={checkAuth}>

      <Route component={Protected} >
        <Route path={`:role/:identity/${modules.OVERVIEW}`} component={Overview} />

        <Route path={`:role/:identity/${modules.COMPANY}`} component={Company}>
          <Route path="create" component={NewProfile} />
          <Route path=":carrierId/profile" component={EditProfile} />
          <Route path=":carrierId/service" component={Service} />
        </Route>

        <Route path={`:role/:identity/${modules.ACCOUNT}`} component={Account}>
          <Route path="create" component={AccountProfile} />
          <Route path=":accountId/profile" component={AccountProfile} />
        </Route>

        <Route path={`:role/:identity/${modules.VERIFICATION_SDK}`} component={Verification}>
          <IndexRedirect to="overview" />
          <Route path="overview" component={VerificationOverview} />
          <Route path="details" component={VerificationDetails} />
        </Route>

        <Route path={`:role/:identity/${modules.VSF}`}>
          <IndexRedirect to="overview" />
          <Route path="overview" component={VsfOverview} />
          <Route path="details" component={VsfDetails} />
        </Route>

        <Route path={`:role/:identity/${modules.CALL}`}>
          <IndexRedirect to="overview" />
          <Route path="overview" component={CallsOverview} />
          <Route path="details" component={Calls} />
        </Route>

        <Route path={`:role/:identity/${modules.END_USER}`}>
          <IndexRedirect to="overview" />
          <Route path="overview" component={EndUsersOverview} />
          <Route path="details" component={EndUsersDetails} />
          <Route path="whitelist" component={WhitelistList} />
          <Route path="whitelist/new" component={WhitelistNew} />
        </Route>

        <Route path={`:role/:identity/${modules.IM}`}>
          <IndexRedirect to="overview" />
          <Route path="overview" component={ImOverview} />
          <Route path="details" component={Im} />
        </Route>

        <Route path={`:role/:identity/${modules.SMS}`}>
          <IndexRedirect to="overview" />
          <Route path="overview" component={SmsOverview} />
          <Route path="details" component={SMS} />
        </Route>

        <Route path={`:role/:identity/${modules.TOP_UP}`}>
          <IndexRedirect to="details" />
          <Route path="details" component={TopUp} />
        </Route>

        <Route path={`:role/:identity/${modules.ACCESS_MANAGEMENT}`}>
          <IndexRedirect to="roles" />
          <Route path="roles" component={RolesTablePage} />
        </Route>
      </Route>

      <Route path={path401} component={Error401} />
      <Route path={path404} component={Error404} />
      <Route path={path500} component={Error500} />
      <Route path="*" component={Error404} />
    </Route>
  );
};
