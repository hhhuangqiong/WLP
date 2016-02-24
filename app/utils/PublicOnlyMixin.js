import AuthStore from '../main/stores/AuthStore';
import { userPath } from '../server/paths';

module.exports = {
  statics: {
    willTransitionTo(transition) {
      const authStore = transition.context.getActionContext().getStore(AuthStore);

      const isAuthenticated = authStore.isAuthenticated();
      const role = authStore.getUserRole();
      const identity = authStore.getCarrierId();

      const authority = transition.context.getComponentContext().getAuthority();
      const defaultPath = authority.getDefaultPath();

      if (isAuthenticated) {
        if (defaultPath) {
          transition.redirect(userPath(role, identity, defaultPath));
        } else {
          transition.redirect('/error/not-found');
        }
      }
    },
  },
};
