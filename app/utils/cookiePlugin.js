import Cookie from './Cookie';

module.exports = {
  name: 'CookiePlugin',

  plugContext(options) {
    // 30 mins (30* 60) as default
    let maxAge = options.config && options.config.COOKIE.MAX_AGE || 60 * 30;

    return {
      plugActionContext(actionContext) {
        actionContext.cookie = new Cookie({
          req: options.req,
          res: options.res,
          maxAge: maxAge,
        });
      },

      dehydrate() {
        return {
          maxAge: maxAge,
        };
      },

      rehydrate(state) {
        maxAge = state.maxAge;
      },
    };
  },
};
