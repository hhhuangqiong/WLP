/*TODO rename this file as 'app'*/
import Fluxible from 'fluxible';

import ApplicationStore from './main/stores/ApplicationStore';
import VerificationStore from './modules/verification/stores/VerificationStore';
import VerificationOverviewStore from './modules/verification/stores/VerificationOverviewStore';
import CompanyStore from './modules/company/stores/CompanyStore';
import EndUserStore from './modules/end-user/stores/EndUserStore';
import SignInStore from './main/stores/SignInStore';
import OverviewStore from './modules/overview/stores/OverviewStore';
import AccountStore from './modules/account/stores/AccountStore';
import CreatePasswordStore from './modules/account/stores/CreatePasswordStore';
import ChangePasswordStore from './modules/account/stores/ChangePasswordStore';
import CallsStore from './modules/calls/stores/CallsStore';
import SMSStore from './modules/sms/stores/SMSStore';
import TopUpStore from './modules/top-up/stores/TopUpStore';
import ImStore from './modules/im/stores/ImStore';
import SystemMessageStore from './main/stores/SystemMessageStore';
import LoadingSpinnerStore from './main/stores/LoadingSpinnerStore';
import VSFTransactionStore from './modules/virtual-store-front/stores/VSFTransactionStore';
import ExportStore from './main/file-export/stores/ExportStore';

// seems not passing anything is okay
let app = new Fluxible();

app.plug(require('./utils/apiPlugin'));
app.plug(require('./utils/cookiePlugin'));
app.plug(require('./utils/authorityPlugin'));
app.plug(require('./utils/routerPlugin')());

// authentication support
app.registerStore(require('./main/stores/AuthStore'));

// register other stores below
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
app.registerStore(SMSStore);
app.registerStore(TopUpStore);
app.registerStore(SystemMessageStore);
app.registerStore(LoadingSpinnerStore);
app.registerStore(ImStore);
app.registerStore(VSFTransactionStore);
app.registerStore(ExportStore);

export default app;
