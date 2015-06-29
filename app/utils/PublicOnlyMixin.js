import AuthStore from '../stores/AuthStore';
import config from '../config';
import {userPath} from '../server/paths';

module.exports = {
  statics: {
    willTransitionTo: function(transition) {
      let authStore       = transition.context.getActionContext().getStore(AuthStore);

      let isAuthenticated = authStore.isAuthenticated();
      let role            = authStore.getUserRole();
      let identity        = authStore.getCarrierId();

      if (isAuthenticated) {
        transition.redirect(userPath(role, identity, config.DEFAULT_POST_LOGIN_PATH));
      }
    }
  }
}

