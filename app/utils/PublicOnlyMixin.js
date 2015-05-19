import AuthStore from '../stores/AuthStore';

module.exports = {
  statics: {
    willTransitionTo: function(transition) {
      let isAuthenticated = transition.context
        .getActionContext().getStore(AuthStore).isAuthenticated();

      let role = transition.context
        .getActionContext().getStore(AuthStore).getUserRole();

      let identity = transition.context
        .getActionContext().getStore(AuthStore).getCarrierId();

      role = role ? '/' + role : '';
      identity = identity ? '/' + identity : '';

      let destination = `${role}${identity}/overview`;

      if (isAuthenticated) {
        transition.redirect(destination);
      }
    }
  }
};

