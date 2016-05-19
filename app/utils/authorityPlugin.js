import AuthorityChecker from '../modules/authority/plugin';

module.exports = {
  name: 'AuthorityPlugin',

  plugContext(options) {
    const authorityChecker = new AuthorityChecker(options);

    return {
      plugComponentContext(componentContext) {
        // eslint-disable-next-line no-param-reassign
        componentContext.authorityChecker = authorityChecker;
      },
      plugActionContext(actionContext) {
        // eslint-disable-next-line no-param-reassign
        actionContext.authorityChecker = authorityChecker;
      },
    };
  },
};
