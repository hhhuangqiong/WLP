import Fluxible from 'fluxible';

/* eslint-disable max-len */
import InitialDataStore from './main/stores/InitialDataStore';
import ApplicationStore from './main/stores/ApplicationStore';
import AuthStore from './main/stores/AuthStore';
import AuthorityStore from './modules/authority/store';
import VerificationStore from './modules/verification/stores/VerificationStore';
import VerificationOverviewStore from './modules/verification/stores/VerificationOverviewStore';
import CompanyStore from './modules/company/stores/CompanyStore';
import EndUserStore from './modules/end-user/stores/EndUserStore';
import AccountStore from './modules/account/stores/AccountStore';
import CreatePasswordStore from './modules/account/stores/CreatePasswordStore';
import ChangePasswordStore from './modules/account/stores/ChangePasswordStore';
import CallsStore from './modules/calls/stores/CallsStore';
import CallsOverviewStore from './modules/calls/stores/CallsOverviewStore';
import TopUpStore from './modules/top-up/stores/TopUpStore';
import ImStore from './modules/im/stores/ImStore';
import ImMonthlyStatsStore from './modules/im/stores/MonthlyStats';
import ImSummaryStatsStore from './modules/im/stores/SummaryStats';
import SystemMessageStore from './main/system-message/store';
import LoadingSpinnerStore from './main/stores/LoadingSpinnerStore';
import VsfTransactionStore from './modules/vsf/stores/details';
import VsfMonthlyStatsStore from './modules/vsf/stores/monthlyStats';
import VsfSummaryStatsStore from './modules/vsf/stores/summaryStats';
import ExportStore from './main/file-export/stores/ExportStore';
import EndUsersOverviewStore from './modules/end-user/stores/EndUsersOverviewStore';
import EndUsersRegistrationStatsStore from './modules/end-user/stores/EndUsersRegistrationStatsStore';
import EndUsersGeographicStatsStore from './modules/end-user/stores/EndUsersGeographicStatsStore';
import EndUsersWhitelistStore from './modules/end-user/stores/Whitelist';
import EndUsersCreateWhitelistStore from './modules/end-user/stores/CreateWhitelist';

import OverviewSummaryStatsStore from './modules/overview/stores/summaryStats';
import OverviewDetailStatsStore from './modules/overview/stores/detailStats';

import SMSStore from './modules/sms/stores/SMSStore';
import SmsSummaryStatsStore from './modules/sms/stores/summaryStats';
import SmsMonthlyStatsStore from './modules/sms/stores/monthlyStats';

import RolesStore from './modules/access-management/stores/RoleStore';
/* eslint-enable max-len */

import getRoutes from './routes';
const routes = getRoutes();
const app = new Fluxible({
  // doing this so that in app/client/index.js
  // context.getComponent() will be available
  component: routes,
});

app.plug(require('./utils/apiPlugin'));
//app.plug(require('./utils/authorityPlugin'));

app.registerStore(InitialDataStore);
app.registerStore(AuthStore);
app.registerStore(AuthorityStore);
app.registerStore(ApplicationStore);
app.registerStore(CompanyStore);
app.registerStore(VerificationStore);
app.registerStore(VerificationOverviewStore);
app.registerStore(EndUserStore);
app.registerStore(AccountStore);
app.registerStore(CreatePasswordStore);
app.registerStore(ChangePasswordStore);
app.registerStore(CallsStore);
app.registerStore(CallsOverviewStore);
app.registerStore(TopUpStore);
app.registerStore(SystemMessageStore);
app.registerStore(LoadingSpinnerStore);
app.registerStore(ImStore);
app.registerStore(ImMonthlyStatsStore);
app.registerStore(ImSummaryStatsStore);
app.registerStore(VsfTransactionStore);
app.registerStore(VsfMonthlyStatsStore);
app.registerStore(VsfSummaryStatsStore);
app.registerStore(ExportStore);
app.registerStore(EndUsersOverviewStore);
app.registerStore(EndUsersRegistrationStatsStore);
app.registerStore(EndUsersGeographicStatsStore);
app.registerStore(EndUsersWhitelistStore);
app.registerStore(EndUsersCreateWhitelistStore);

app.registerStore(OverviewSummaryStatsStore);
app.registerStore(OverviewDetailStatsStore);

app.registerStore(SMSStore);
app.registerStore(SmsSummaryStatsStore);
app.registerStore(SmsMonthlyStatsStore);

app.registerStore(RolesStore);

export default app;
