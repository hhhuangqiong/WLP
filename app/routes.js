import React from 'react';
import { Route, IndexRedirect } from 'react-router';
import { startsWith, includes, rest } from 'lodash';
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
  function requireAuthentication(nextState, replace, cb) {
    const path = nextState.location.pathname;
    const pathParts = path.split('/').filter(x => !!x);
    debug(`Starting authentication check for path: ${path}. Path parts: `, pathParts);
    // Omit carrier id from url
    const sectionPath = `/${rest(pathParts).join('/')}`;
    debug(`Authentication path will be ${sectionPath}`);

    const store = context.getStore(AuthStore);
    const user = store.getUser();
    if (!user) {
      debug('There is no user in AuthStore, redirecting to sign-in');
      replace('/sign-in');
      cb();
      return;
    }
    // There is hope user.permissions will contain actual permissions for the company
    // he is acting from. CompanySwitcher reloads the entire page, so AuthStore should
    // contain relevant information from req.user already including permissions and capabilities
    const hasCarrierIdInPath = pathParts.length >= 1;
    debug(`Carrier id found in path: ${hasCarrierIdInPath}.`);
    const carrierId = hasCarrierIdInPath ? pathParts[0] : user.carrierId;
    const permissions = user.permissions || [];

    const currentSection = navigationSections.find(x => startsWith(sectionPath, x.path));
    if (currentSection) {
      debug(`Starting permission check with permissions: ${permissions.join(', ')}.`);
      if (includes(permissions, currentSection.permission)) {
        debug(`User ${user.username} is allowed to view the page: ${sectionPath}`);
        if (!hasCarrierIdInPath) {
          replace(`${carrierId}${sectionPath}`);
        }
        cb();
        return;
      }
    }
    debug(`Will need to determine default page for user ${user.username} because he is not allowed to go to ${sectionPath}`);
    const defaultSection = navigationSections.find(x => includes(user.permissions, x.permission));
    if (defaultSection) {
      debug(`Redirecting ${user.username} to default path: ${defaultSection.path}.`);
      replace(`${carrierId}${defaultSection.path}`);
      cb();
      return;
    }

    debug(`Redirecting to sign in, failed to determine default page for ${user.username}.`);
    // Redirect to sign in otherwise
    replace('/sign-in');
    cb();
  }

  return (
    <Route path="/" component={App} onEnter={requireAuthentication}>

      <Route component={Protected}>
        <Route path={`:identity/${modules.OVERVIEW}`} component={Overview} />

        <Route path={`:identity/${modules.COMPANY}`}>
          <IndexRedirect to="overview" />
          <Route path="overview" component={Company} />
          <Route path="create" component={CompanyProfile} />
          <Route path=":companyId/edit" component={CompanyEditForm} />
        </Route>

        <Route path={`:identity/${modules.ACCOUNT}`} component={Account}>
          <Route path="create" component={AccountProfile} />
          <Route path=":accountId/profile" component={AccountProfile} />
        </Route>

        <Route path={`:identity/${modules.VERIFICATION_SDK}`} component={Verification}>
          <IndexRedirect to="overview" />
          <Route path="overview" component={VerificationOverview} />
          <Route path="details" component={VerificationDetails} />
        </Route>

        <Route path={`:identity/${modules.VSF}`}>
          <IndexRedirect to="overview" />
          <Route path="overview" component={VsfOverview} />
          <Route path="details" component={VsfDetails} />
        </Route>

        <Route path={`:identity/${modules.CALL}`}>
          <IndexRedirect to="overview" />
          <Route path="overview" component={CallsOverview} />
          <Route path="details" component={Calls} />
        </Route>

        <Route path={`:identity/${modules.END_USER}`}>
          <IndexRedirect to="overview" />
          <Route path="overview" component={EndUsersOverview} />
          <Route path="details" component={EndUsersDetails} />
          <Route path="whitelist" component={WhitelistList} />
          <Route path="whitelist/new" component={WhitelistNew} />
        </Route>

        <Route path={`:identity/${modules.IM}`}>
          <IndexRedirect to="overview" />
          <Route path="overview" component={ImOverview} />
          <Route path="details" component={Im} />
        </Route>

        <Route path={`:identity/${modules.SMS}`}>
          <IndexRedirect to="overview" />
          <Route path="overview" component={SmsOverview} />
          <Route path="details" component={SMS} />
        </Route>

        <Route path={`:identity/${modules.TOP_UP}`}>
          <IndexRedirect to="details" />
          <Route path="details" component={TopUp} />
        </Route>

        <Route path={`:identity/${modules.ACCESS_MANAGEMENT}`}>
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
