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
import SignInStore from './modules/sign-in/store';
import OverviewStore from './modules/overview/stores/OverviewStore';
import AccountStore from './modules/account/stores/AccountStore';
import CreatePasswordStore from './modules/account/stores/CreatePasswordStore';
import ChangePasswordStore from './modules/account/stores/ChangePasswordStore';
import CallsStore from './modules/calls/stores/CallsStore';
import CallsOverviewStore from './modules/calls/stores/CallsOverviewStore';
import SMSStore from './modules/sms/stores/SMSStore';
import TopUpStore from './modules/top-up/stores/TopUpStore';
import ImStore from './modules/im/stores/ImStore';
import SystemMessageStore from './main/stores/SystemMessageStore';
import LoadingSpinnerStore from './main/stores/LoadingSpinnerStore';
import VSFTransactionStore from './modules/virtual-store-front/stores/VSFTransactionStore';
import VsfMonthlyStatsStore from './modules/virtual-store-front/stores/VsfMonthlyStatsStore';
import VsfSummaryStatsStore from './modules/virtual-store-front/stores/VsfSummaryStatsStore';
import ExportStore from './main/file-export/stores/ExportStore';
import EndUsersOverviewStore from './modules/end-user/stores/EndUsersOverviewStore';
import EndUsersRegistrationStatsStore from './modules/end-user/stores/EndUsersRegistrationStatsStore';
import EndUsersGeographicStatsStore from './modules/end-user/stores/EndUsersGeographicStatsStore';
/* eslint-enable max-len */

import getRoutes from './routes';
const routes = getRoutes();
const app = new Fluxible({
  // doing this so that in app/client/index.js
  // context.getComponent() will be available
  component: routes,
});

app.plug(require('./utils/apiPlugin'));
app.plug(require('./utils/authorityPlugin'));

app.registerStore(InitialDataStore);
app.registerStore(AuthStore);
app.registerStore(AuthorityStore);
app.registerStore(ApplicationStore);
app.registerStore(CompanyStore);
app.registerStore(VerificationStore);
app.registerStore(VerificationOverviewStore);
app.registerStore(EndUserStore);
app.registerStore(SignInStore);
app.registerStore(OverviewStore);
app.registerStore(AccountStore);
app.registerStore(CreatePasswordStore);
app.registerStore(ChangePasswordStore);
app.registerStore(CallsStore);
app.registerStore(CallsOverviewStore);
app.registerStore(SMSStore);
app.registerStore(TopUpStore);
app.registerStore(SystemMessageStore);
app.registerStore(LoadingSpinnerStore);
app.registerStore(ImStore);
app.registerStore(VSFTransactionStore);
app.registerStore(VsfMonthlyStatsStore);
app.registerStore(VsfSummaryStatsStore);
app.registerStore(ExportStore);
app.registerStore(EndUsersOverviewStore);
app.registerStore(EndUsersRegistrationStatsStore);
app.registerStore(EndUsersGeographicStatsStore);

export default app;
