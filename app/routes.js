import React from 'react';
import { Route, IndexRedirect } from 'react-router';
import { startsWith, includes } from 'lodash';
import validator from 'validator';
import modules from './constants/moduleId';
import navigationSections from './main/constants/navSection';

import App from './main/components/common/App';

import Protected from './main/components/common/Protected';
import Company from './modules/company/components/Company';
import CompanyProfile from './modules/company/components/CompanyProfile';
import CompanyEditForm from './modules/company/components/CompanyEditForm';
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

import createDebug from 'debug';

const debug = createDebug('app:routes');

export default (context) => {
  // handle whether user login or not and redirect to the assigned carrier
  function checkLogin(nextState, replace) {
    const store = context.getStore(AuthStore);
    const user = store.getUser();
    // not login, redirect to sign in page on IAM
    if (!user) {
      debug('There is no user in AuthStore, redirecting to sign-in');
      replace('/sign-in');
      return;
    }

    if (nextState.location.pathname === '/') {
      // only redirect to carrierId path
      replace(`/${user.carrierId}`);
    }
  }

  // check for the permission and set the default path for that carrier(if not mentioned)
  function checkAuth(nextState, replace) {
    const { routes, params: { identity: carrierId } } = nextState;
    // check the carrierId format and return early if not valid carrierid format
    // @TODO check why demo_verify.maaiii-api.org fail validator.isURL
    // at this moment it fails because of underscore of demo_verify
    if (!validator.isURL(carrierId) && carrierId !== 'demo_verify.maaiii-api.org') {
      replace(path404);
      return;
    }

    const store = context.getStore(AuthStore);
    const user = store.getUser();
    // if it doesn't mention the target page, then assign the default section
    if (routes.length === 2) {
      const defaultSection = navigationSections.find(x => includes(user.permissions, x.permission));
      if (defaultSection) {
        replace(`/${carrierId}${defaultSection.path}`);
        return;
      }
      // no default page and thus no permission to enter this carrierId
      replace(path401);
      return;
    }
    // find the current section and validate the permission
    const sectionPath = routes[2].path;
    const currentSection = navigationSections.find(x => startsWith(`/${sectionPath}`, x.path));
    const permissions = user.permissions || [];

    // not allow to access
    if (!includes(permissions, currentSection.permission)) {
      debug(`User ${user.username} is not allowed to view the page: ${sectionPath}`);
      replace(path401);
      return;
    }
    debug(`User ${user.username} is allowed to view the page: ${sectionPath}`);
  }

  return (
    <Route path="/" component={App} onEnter={checkLogin} >

      <Route path={':identity'} component={Protected} onEnter={checkAuth}>
        <Route path={`${modules.OVERVIEW}`} component={Overview} />

        <Route path={`${modules.COMPANY}`}>
          <IndexRedirect to="overview" />
          <Route path="overview" component={Company} />
          <Route path="create" component={CompanyProfile} />
          <Route path=":companyId/edit" component={CompanyEditForm} />
        </Route>

        <Route path={`${modules.ACCOUNT}`} component={Account}>
          <Route path="create" component={AccountProfile} />
          <Route path=":accountId/profile" component={AccountProfile} />
        </Route>

        <Route path={`${modules.VERIFICATION_SDK}`} component={Verification}>
          <IndexRedirect to="overview" />
          <Route path="overview" component={VerificationOverview} />
          <Route path="details" component={VerificationDetails} />
        </Route>

        <Route path={`${modules.VSF}`}>
          <IndexRedirect to="overview" />
          <Route path="overview" component={VsfOverview} />
          <Route path="details" component={VsfDetails} />
        </Route>

        <Route path={`${modules.CALL}`}>
          <IndexRedirect to="overview" />
          <Route path="overview" component={CallsOverview} />
          <Route path="details" component={Calls} />
        </Route>

        <Route path={`${modules.END_USER}`}>
          <IndexRedirect to="overview" />
          <Route path="overview" component={EndUsersOverview} />
          <Route path="details" component={EndUsersDetails} />
          <Route path="whitelist" component={WhitelistList} />
          <Route path="whitelist/new" component={WhitelistNew} />
        </Route>

        <Route path={`${modules.IM}`}>
          <IndexRedirect to="overview" />
          <Route path="overview" component={ImOverview} />
          <Route path="details" component={Im} />
        </Route>

        <Route path={`${modules.SMS}`}>
          <IndexRedirect to="overview" />
          <Route path="overview" component={SmsOverview} />
          <Route path="details" component={SMS} />
        </Route>

        <Route path={`${modules.TOP_UP}`}>
          <IndexRedirect to="details" />
          <Route path="details" component={TopUp} />
        </Route>

        <Route path={`${modules.ACCESS_MANAGEMENT}`}>
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
