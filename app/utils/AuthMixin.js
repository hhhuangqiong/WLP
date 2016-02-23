import cookie from 'cookie';

import AuthStore from '../main/stores/AuthStore';
import { CLIENT } from './env';
import { SIGN_IN } from '../server/paths';

module.exports = {
  statics: {
    willTransitionTo(transition) {
      const context = transition.context.getActionContext();
      const isAuthenticated = context.getStore(AuthStore).isAuthenticated();

      if (isAuthenticated) {
        if (CLIENT) {
          // TODO consolidate the key
          const sessionKey = 'token';
          const sessionKeyVal = cookie.parse(document.cookie)[sessionKey];

          document.cookie = cookie.serialize(sessionKey, sessionKeyVal, {
            maxAge: context.cookie.maxAge(),
          });
        }
      } else {
        transition.redirect(SIGN_IN);
      }
    },
  },
};
