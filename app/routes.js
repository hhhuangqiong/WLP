import React from 'react';
import { Route, IndexRedirect } from 'react-router';
import { startsWith, includes } from 'lodash';
import validator from 'validator';
import modules from './constants/moduleId';
import navigationSections from './main/constants/navSection';

import App from './main/components/common/App';
import Protected from './main/components/common/Protected';

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
  SIGN_IN,
} from './utils/paths';

import AuthStore from './main/stores/AuthStore';

import createDebug from 'debug';

const debug = createDebug('app:routes');


if (typeof window === 'undefined') {
  const load = require;
  // polyfill for NodeJs env that doesn't rely on webpack System.import for code splitting
  global.System = {
    import: (moduleId) => {
      debug(`Nodejs load ${moduleId}`);
      return Promise.resolve(load(moduleId));
    },
  };
}

function loadRoute(importer) {
  return (nextState, cb) => {
    importer().then((module) => {
      debug(`Entry point ${module} loaded`);
      cb(null, module.default);
    })
    .catch((err) => {
      debug('Failed loading module...', err.stack);
    });
  };
}


const Company = loadRoute(() => System.import('./modules/company/components/Company'));
const CompanyProfile = loadRoute(() => System.import('./modules/company/components/CompanyProfile'));
const CompanyEditForm = loadRoute(() => System.import('./modules/company/components/CompanyEditForm'));
const CompanyWallet = loadRoute(() => System.import('./modules/company/components/CompanyWallet'));
const Account = loadRoute(() => System.import('./modules/account/components/Account'));
const AccountProfile = loadRoute(() => System.import('./modules/account/components/AccountProfile'));
const Verification = loadRoute(() => System.import('./modules/verification/components/Verification'));
const VerificationOverview = loadRoute(() => System.import('./modules/verification/components/VerificationOverview'));
const VerificationDetails = loadRoute(() => System.import('./modules/verification/components/VerificationDetails'));
const VsfOverview = loadRoute(() => System.import('./modules/vsf/components/overview/Overview'));
const VsfDetails = loadRoute(() => System.import('./modules/vsf/components/VsfDetails'));
const Overview = loadRoute(() => System.import('./modules/overview/components/Overview'));
const CallsOverview = loadRoute(() => System.import('./modules/calls/components/CallsOverview'));
const Calls = loadRoute(() => System.import('./modules/calls/components/Calls'));
const EndUsersOverview = loadRoute(() => System.import('./modules/end-user/components/EndUsersOverview'));
const EndUsersDetails = loadRoute(() => System.import('./modules/end-user/components/EndUsersDetails'));
const WhitelistList = loadRoute(() => System.import('./modules/end-user/containers/Whitelist/List'));
const WhitelistNew = loadRoute(() => System.import('./modules/end-user/containers/Whitelist/AddNew'));
const ImOverview = loadRoute(() => System.import('./modules/im/components/Overview'));
const Im = loadRoute(() => System.import('./modules/im/components/Im'));
const SmsOverview = loadRoute(() => System.import('./modules/sms/components/Overview'));
const SMS = loadRoute(() => System.import('./modules/sms/components/SMS'));
const TopUp = loadRoute(() => System.import('./modules/top-up/components/TopUp'));
const RolesTablePage = loadRoute(() => System.import('./modules/access-management/components/RolesPage'));


export default (context) => {
  // handle whether user login or not and redirect to the assigned carrier
  function checkLogin(nextState, replace) {
    if (nextState.location.pathname !== '/') {
      return;
    }
    const store = context.getStore(AuthStore);
    const user = store.getUser();
    // not login, redirect to sign in page on IAM
    if (!user) {
      debug('There is no user in AuthStore, redirecting to sign-in');
      replace(SIGN_IN);
      return;
    }
    // only redirect to carrierId path
    replace(`/${user.carrierId}`);
  }

  // check for the permission and set the default path for that carrier(if not mentioned)
  function checkAuth(nextState, replace) {
    const { routes, params: { identity: carrierId } } = nextState;
    // check the carrierId format and return early if not valid carrierid format
    if (!validator.isURL(carrierId, { allow_underscores: true })) {
      replace(path404);
      return;
    }

    const store = context.getStore(AuthStore);
    const user = store.getUser();
    // when try to access without user, redirect to login page
    if (!user) {
      replace(SIGN_IN);
      return;
    }
    // if it doesn't mention the target page, then assign the default section
    if (routes.length === 2) {
      debug('loading default section');
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
        <Route path={`${modules.OVERVIEW}`} getComponent={Overview} />

        <Route path={`${modules.COMPANY}`}>
          <IndexRedirect to="overview" />
          <Route path="overview" getComponent={Company} />
          <Route path="create" getComponent={CompanyProfile} />
          <Route path=":provisionId/edit" getComponent={CompanyEditForm} />
          <Route path=":carrierId/wallet" getComponent={CompanyWallet} />
        </Route>

        <Route path={`${modules.ACCOUNT}`} getComponent={Account}>
          <Route path="create" getComponent={AccountProfile} />
          <Route path=":accountId/profile" getComponent={AccountProfile} />
        </Route>

        <Route path={`${modules.VERIFICATION_SDK}`} getComponent={Verification}>
          <IndexRedirect to="overview" />
          <Route path="overview" getComponent={VerificationOverview} />
          <Route path="details" getComponent={VerificationDetails} />
        </Route>

        <Route path={`${modules.VSF}`}>
          <IndexRedirect to="overview" />
          <Route path="overview" getComponent={VsfOverview} />
          <Route path="details" getComponent={VsfDetails} />
        </Route>

        <Route path={`${modules.CALL}`}>
          <IndexRedirect to="overview" />
          <Route path="overview" getComponent={CallsOverview} />
          <Route path="details" getComponent={Calls} />
        </Route>

        <Route path={`${modules.END_USER}`}>
          <IndexRedirect to="overview" />
          <Route path="overview" getComponent={EndUsersOverview} />
          <Route path="details" getComponent={EndUsersDetails} />
          <Route path="whitelist" getComponent={WhitelistList} />
          <Route path="whitelist/new" getComponent={WhitelistNew} />
        </Route>

        <Route path={`${modules.IM}`}>
          <IndexRedirect to="overview" />
          <Route path="overview" getComponent={ImOverview} />
          <Route path="details" getComponent={Im} />
        </Route>

        <Route path={`${modules.SMS}`}>
          <IndexRedirect to="overview" />
          <Route path="overview" getComponent={SmsOverview} />
          <Route path="details" getComponent={SMS} />
        </Route>

        <Route path={`${modules.TOP_UP}`}>
          <IndexRedirect to="details" />
          <Route path="details" getComponent={TopUp} />
        </Route>

        <Route path={`${modules.ACCESS_MANAGEMENT}`}>
          <IndexRedirect to="roles" />
          <Route path="roles" getComponent={RolesTablePage} />
        </Route>
      </Route>

      <Route path={path401} component={Error401} />
      <Route path={path404} component={Error404} />
      <Route path={path500} component={Error500} />
      <Route path="*" component={Error404} />
    </Route>
  );
};
