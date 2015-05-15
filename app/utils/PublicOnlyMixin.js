import AuthStore from '../stores/AuthStore';

module.exports = {
  statics: {
    willTransitionTo: function(transition) {
      let isAuthenticated = transition.context
        .getActionContext().getStore(AuthStore).isAuthenticated();

      let urlPrefix = transition.context
        .getActionContext().getStore(AuthStore).getUserUrlPrefix();

      let destination = `${urlPrefix}/companies`;

      if (isAuthenticated) {
        transition.redirect(destination);
      }
    }
  }
};

