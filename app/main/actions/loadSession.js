import _ from 'lodash';
import nconf from 'nconf';
import { introspect } from '../../server/openid/manager';
import { fetchDep } from '../../server/utils/bottle';

let debug = require('debug');
debug = debug('app:actions/loadSession');

module.exports = (context, payload, done) => {
  debug('Started');

  // This is currently called from server side, so user will be already here
  const user = _.get(payload, 'req.user');

  // if no user, then load session with null. Auth Store will set without user
  // when enter the page, it will redirect to sign in and get it.
  if (!user || !user.tokens) {
    // ensure to log out
    payload.req.logout();
    context.dispatch('LOAD_SESSION', null);
    done(null);
    return;
  }

  // if user exist, verify the token
  introspect(user.tokens.access_token).then(details => {
    if (details.active) {
      const iamServiceClient = fetchDep(nconf.get('containerName'), 'IamServiceClient');
      iamServiceClient.getUser({ id: user.username })
        .then(userInfo => {
          const userDetail = _.merge(userInfo, user);
          context.dispatch('LOAD_SESSION', userDetail);
          done(null, userDetail);
        }).catch(err => {
          // fail to get the user info
          context.dispatch('LOAD_SESSION', null);
          done(err);
        });
      return;
    }
    // expect the user should logout and redirect to the sign in page.
    payload.req.logout();
    context.dispatch('LOAD_SESSION', null);
    done(null);
  }).catch(err => {
    context.dispatch('LOAD_SESSION', null);
    done(err);
  });
};
