import AuthStore from '../main/stores/AuthStore';
import config from '../config';
import {userPath} from '../server/paths';

module.exports = {
  statics: {
    willTransitionTo: function(transition) {
      let authStore       = transition.context.getActionContext().getStore(AuthStore);

      let isAuthenticated = authStore.isAuthenticated();
      let role            = authStore.getUserRole();
      let identity        = authStore.getCarrierId();

      let authority = transition.context.getComponentContext().getAuthority();
      let defaultPath = authority.getDefaultPath();

      if (isAuthenticated) {
        if (defaultPath) {
          transition.redirect(userPath(role, identity, defaultPath));
        } else {
          transition.redirect('/error/not-found');
        }
      }
    }
  }
}
