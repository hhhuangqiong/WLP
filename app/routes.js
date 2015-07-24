import React from 'react';
import { Route, NotFoundRoute, Redirect, DefaultRoute } from 'react-router';
import { CLIENT } from './utils/env';
import { Error401, Error404, Error500 } from './main/components/Errors';

// path strings
import { ERROR_401 as pathError401, ERROR500 as pathError500 } from './server/paths';

// convention: separate path by "-" following the component name

// react-router acts differently from CLIENT to SERVER
// CLIENT side react-router could recognize `to` property as route name while
// SERVER side react-router takes to as URL
let redirectForCallsOverview = CLIENT ? 'calls-details' : 'calls/details';

export default (
  <Route handler={require('./components/App')}>
    <Redirect from="/" to="sign-in" />

    // public pages,
    <Route handler={require('./components/common/Public')}>
      <Route name="sign-in" handler={require('./components/SignIn')}/>
    </Route>

    <Route handler={require('./components/common/Protected')}>
      <Redirect from="/:role/:identity?/calls" to={redirectForCallsOverview} />

      <Route name="vsf-transaction-overview" path="/:role/:identity?/vsf" handler={require('./modules/virtual-store-front/components/VSFTransactionOverview')} />
      <Route name="vsf-transaction-details" path="/:role/:identity?/vsf/details" handler={require('./modules/virtual-store-front/components/VSFTransactionDetails')} />

      <Route name="overview" path="/:role/:identity?/overview" handler={require('./modules/overview/components/Overview')} />
      /*
        <Route name="calls-overview" path="/:role/:identity?/calls" handler={require('./components/CallsOverview')} />
      */
      <Route name="calls-details" path="/:role/:identity?/calls/details" handler={require('./components/Calls')} />

	    <Route name="end-users" path="/:role/:identity?/endusers" handler={require('./modules/end-user/components/EndUsers')} />

      <Route name="im-overview" path="/:role/:identity?/im" handler={require('./components/ImOverview')} />
      <Route name="im" path="/:role/:identity?/im/details" handler={require('./components/Im')} />

      <Route name="sms-overview" path="/:role/:identity?/sms" handler={require('./modules/sms/components/Overview')} />
      <Route name="sms-details" path="/:role/:identity?/sms/details" handler={require('./modules/sms/components/SMS')} />

      <Route name="top-up-details" path="/:role/:identity?/top-up/details" handler={require('./modules/top-up/components/TopUp')} />
    </Route>

    // shared by both "public" &amp; "protected"
    <Route name="access-denied" path={pathError401} handler={Error401} />
    <Route name="internal-server-error" path={pathError500} handler={Error500} />

    <NotFoundRoute name="not-found" handler={Error404} />
  </Route>
);
