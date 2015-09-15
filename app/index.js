/*TODO rename this file as 'app'*/
import Fluxible from 'fluxible';

import ApplicationStore from './stores/ApplicationStore';
import VerificationStore from './modules/verification/stores/VerificationStore';
import CompanyStore from './modules/company/stores/CompanyStore';
import EndUserStore from './modules/end-user/stores/EndUserStore';
import SignInStore from './stores/SignInStore';
import OverviewStore from './modules/overview/stores/OverviewStore';
import CallsStore from './stores/CallsStore';
import SMSStore from './modules/sms/stores/SMSStore';
import TopUpStore from './modules/top-up/stores/TopUpStore';
import ImStore from './stores/ImStore';
import SystemMessageStore from './stores/SystemMessageStore';
import LoadingSpinnerStore from './stores/LoadingSpinnerStore';
import VSFTransactionStore from './modules/virtual-store-front/stores/VSFTransactionStore';
import ExportStore from './main/file-export/stores/ExportStore';

// seems not passing anything is okay
let app = new Fluxible();

app.plug(require('./utils/apiPlugin'));
app.plug(require('./utils/cookiePlugin'));
app.plug(require('./utils/routerPlugin')());

// authentication support
app.registerStore(require('./stores/AuthStore'));

// register other stores below
app.registerStore(ApplicationStore);
app.registerStore(CompanyStore);
app.registerStore(VerificationStore);
app.registerStore(EndUserStore);
app.registerStore(SignInStore);
app.registerStore(OverviewStore);
app.registerStore(CallsStore);
app.registerStore(SMSStore);
app.registerStore(TopUpStore);
app.registerStore(SystemMessageStore);
app.registerStore(LoadingSpinnerStore);
app.registerStore(ImStore);
app.registerStore(VSFTransactionStore);
app.registerStore(ExportStore);

export default app;
