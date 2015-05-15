import AuthStore from '../stores/AuthStore';

module.exports = {
  statics: {
    willTransitionTo: function(transition) {
      let isAuthenticated = transition.context
        .getActionContext().getStore(AuthStore).isAuthenticated();

      if (!isAuthenticated) {
        // TODO externalize the path
        transition.redirect('/sign-in');
      }
    }
  }
};
