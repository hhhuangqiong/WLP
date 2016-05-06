import Authority from '../modules/authority/plugin';

module.exports = {
  name: 'AuthorityPlugin',

  plugContext(options) {
    const authorityChecker = new Authority(options);

    return {
      plugComponentContext(componentContext) {
        componentContext.getAuthority = () => authorityChecker;
      },
      plugActionContext(actionContext) {
        actionContext.getAuthority = () => authorityChecker;
      },
    };
  },
};
