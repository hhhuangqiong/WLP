import ApiClient from './ApiClient';

module.exports = {
  name: 'ApiPlugin',

  plugContext(options) {
    return {
      plugActionContext(actionContext) {
        // eslint-disable-next-line no-param-reassign
        actionContext.apiClient = new ApiClient(options.req, !!options.req);
      },
    };
  },
};
