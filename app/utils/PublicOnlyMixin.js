import AuthStore from '../stores/AuthStore';
import {userPath} from '../server/paths';

module.exports = {
  statics: {
    willTransitionTo: function(transition) {
      let authStore       = transition.context.getActionContext().getStore(AuthStore);

      let isAuthenticated = authStore.isAuthenticated();
      let role            = authStore.getUserRole();
      let identity        = authStore.getCarrierId();

      if (isAuthenticated) {
        transition.redirect(userPath(role, identity, 'overview'));
      }
    }
  }
};
