import cookie from 'cookie';

import AuthStore from '../main/stores/AuthStore';
import {CLIENT} from './env';
import {SIGN_IN} from '../server/paths';

module.exports = {
  statics: {
    willTransitionTo: function(transition) {
      let context = transition.context.getActionContext();
      let isAuthenticated = context.getStore(AuthStore).isAuthenticated();

      if (isAuthenticated) {
        if (CLIENT) {
          //TODO consolidate the key
          let sessionKey = 'token';
          let sessionKeyVal = cookie.parse(document.cookie)[sessionKey];

          document.cookie = cookie.serialize(sessionKey, sessionKeyVal, {
            maxAge: context.cookie.maxAge()
          });
        }
      } else {
        transition.redirect(SIGN_IN);
      }
    }
  }
};
