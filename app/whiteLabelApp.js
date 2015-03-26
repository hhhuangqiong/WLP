'use strict';
import Fluxible from 'fluxible';

import ApplicationStore from 'app/stores/ApplicationStore';
import TimeStore from 'app/stores/TimeStore';
import Routes from 'app/components/Routes';

var app = new Fluxible({
  component: Routes
});

app.registerStore(ApplicationStore);
app.registerStore(TimeStore);

export default app;
