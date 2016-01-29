import Authority from '../main/authority/checker';

module.exports = {
  name: 'AuthorityPlugin',

  plugContext: function(options) {
    let authorityChecker = new Authority(options);

    return {
      plugComponentContext: function(componentContext) {
        componentContext.getAuthority = function() {
          return authorityChecker;
        };
      },
      plugActionContext: function(actionContext) {
        actionContext.getAuthority = function() {
          return authorityChecker;
        };
      }
    };
  }
};
