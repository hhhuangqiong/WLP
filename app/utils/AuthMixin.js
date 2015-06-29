import cookie from 'cookie';

import AuthStore from '../stores/AuthStore';
import env from './env';
import {SIGN_IN} from '../server/paths';

module.exports = {
  statics: {
    willTransitionTo: function(transition) {
      var context = transition.context.getActionContext()
      var isAuthenticated = context.getStore(AuthStore).isAuthenticated();

      if (isAuthenticated) {
        if (env.CLIENT) {
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
