/*TODO rename this file as 'app'*/
import Fluxible from 'fluxible';

import ApplicationStore from './stores/ApplicationStore';
import CompanyStore from './stores/CompanyStore';
import EndUserStore from './stores/EndUserStore';

// seems not passing anything is okay
var app = new Fluxible();

app.plug(require('./utils/apiPlugin'));
app.plug(require('./utils/cookiePlugin'));
app.plug(require('./utils/routerPlugin')());

// provide authentication support; the only store for now
app.registerStore(require('./stores/AuthStore'));

// TODO should start register other stores below
app.registerStore(ApplicationStore);
app.registerStore(CompanyStore);
app.registerStore(EndUserStore);

export default app;
